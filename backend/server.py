from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import hashlib
import jwt
from passlib.context import CryptContext
import asyncio
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client.get_database("bitsecure")

# Create the main app
app = FastAPI(title="BitSecure Trading Platform")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-here')

# Wallet addresses (user's actual wallets)
WALLET_ADDRESSES = {
    "BTC": "bc1qflt3sxs06c6jnj25hj85py5tjjl4gnsraph9ky",
    "ETH": "0x52665675944E3aa06c8803fB737EB74033fA34DB",
    "USDT": "0x52665675944E3aa06c8803fB737EB74033fA34DB",
    "BNB": "0x52665675944E3aa06c8803fB737EB74033fA34DB",
    "ADA": "addr1qy5mhyrah3qe0swefywe0xdkzqte67ydzqjrd6krzjtuweffhwg8m0zpjlqajjgaj7vmvyqhn4ug6ypyxm4vx9yhcajsgwh3xp"
}

# Trading data simulation
trading_pairs = [
    {"pair": "BTC/USDT", "change": 2.61, "direction": "LONG", "leverage": "20x", "value": 25766.2},
    {"pair": "ETH/USDT", "change": -1.51, "direction": "SHORT", "leverage": "10x", "value": 32751.53},
    {"pair": "BNB/USDT", "change": 5.78, "direction": "LONG", "leverage": "5x", "value": 38132.37},
    {"pair": "ADA/USDT", "change": 1.72, "direction": "SHORT", "leverage": "50x", "value": 32971.98}
]

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    password_hash: str
    balance: float = 0.0  # Users start with 0€, not 100€
    is_admin: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    balance: float
    is_admin: bool
    created_at: datetime

class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str  # deposit, withdrawal
    method: str
    amount: float
    details: str
    status: str = "pending"  # pending, completed, failed
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DepositRequest(BaseModel):
    crypto: str
    amount: float

class VoucherRequest(BaseModel):
    voucher_code: str
    amount: float

class WithdrawalRequest(BaseModel):
    method: str  # paypal, bank, bizum
    amount: float
    details: dict  # Contains method-specific details

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    message: str
    type: str = "deposit"  # deposit, withdrawal, user_registration
    user_id: Optional[str] = None
    data: Optional[dict] = None
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TradingData(BaseModel):
    pairs: List[dict]
    last_updated: datetime

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return UserResponse(**user)

async def get_admin_user(current_user: UserResponse = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

async def create_notification(title: str, message: str, notification_type: str = "deposit", user_id: str = None, data: dict = None):
    notification = Notification(
        title=title,
        message=message,
        type=notification_type,
        user_id=user_id,
        data=data
    )
    await db.notifications.insert_one(notification.dict())

# Routes
@api_router.get("/")
async def root():
    return {"message": "BitSecure Trading Platform API"}

# Authentication routes
@api_router.post("/auth/register", response_model=dict)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = hash_password(user_data.password)
    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_password
    )
    
    # Check if this is the first user (make admin)
    user_count = await db.users.estimated_document_count()
    if user_count == 0:
        user.is_admin = True
    
    await db.users.insert_one(user.dict())
    
    # Create notification for admin
    await create_notification(
        title="Nuevo Usuario Registrado",
        message=f"Se ha registrado un nuevo usuario: {user.name} ({user.email})",
        notification_type="user_registration",
        user_id=user.id,
        data={"user_name": user.name, "user_email": user.email}
    )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(**user.dict())
    }

@api_router.post("/auth/login", response_model=dict)
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user["id"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(**user)
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user

# Deposit routes
@api_router.post("/deposits/crypto")
async def crypto_deposit(deposit_data: DepositRequest, current_user: UserResponse = Depends(get_current_user)):
    if deposit_data.crypto not in WALLET_ADDRESSES:
        raise HTTPException(status_code=400, detail="Criptomoneda no soportada")
    
    if deposit_data.amount < 10:
        raise HTTPException(status_code=400, detail="Monto mínimo de depósito es €10")
    
    # Get the correct wallet address for the crypto
    admin_wallet = WALLET_ADDRESSES[deposit_data.crypto]
    
    # Create transaction
    transaction = Transaction(
        user_id=current_user.id,
        type="deposit",
        method=f"Crypto ({deposit_data.crypto})",
        amount=deposit_data.amount,
        details=f"Usuario: {deposit_data.wallet_address[:10]}... → Admin: {admin_wallet[:10]}...",
        status="completed"
    )
    
    await db.transactions.insert_one(transaction.dict())
    
    # Update user balance
    await db.users.update_one(
        {"id": current_user.id},
        {"$inc": {"balance": deposit_data.amount}}
    )
    
    # Create notification for admin
    await create_notification(
        title="Nuevo Depósito",
        message=f"{current_user.name} ha depositado €{deposit_data.amount} via {deposit_data.crypto}",
        notification_type="deposit",
        user_id=current_user.id,
        data={
            "amount": deposit_data.amount,
            "crypto": deposit_data.crypto,
            "user_wallet": deposit_data.wallet_address,
            "admin_wallet": admin_wallet,
            "transaction_id": transaction.id
        }
    )
    
    return {"message": "Depósito procesado exitosamente", "transaction_id": transaction.id, "admin_wallet": admin_wallet}

@api_router.post("/deposits/voucher")
async def voucher_deposit(voucher_data: VoucherRequest, current_user: UserResponse = Depends(get_current_user)):
    # Simulate random voucher amount
    amount = random.randint(50, 550)
    
    transaction = Transaction(
        user_id=current_user.id,
        type="deposit",
        method="CryptoVoucher",
        amount=amount,
        details=f"Código: {voucher_data.voucher_code}",
        status="completed"
    )
    
    await db.transactions.insert_one(transaction.dict())
    
    # Update user balance
    await db.users.update_one(
        {"id": current_user.id},
        {"$inc": {"balance": amount}}
    )
    
    # Create notification for admin
    await create_notification(
        title="Voucher Canjeado",
        message=f"{current_user.name} ha canjeado un voucher por €{amount}",
        notification_type="deposit",
        user_id=current_user.id,
        data={
            "amount": amount,
            "voucher_code": voucher_data.voucher_code,
            "transaction_id": transaction.id
        }
    )
    
    return {"message": f"Voucher canjeado: €{amount} añadido", "amount": amount}

# Withdrawal routes
@api_router.post("/withdrawals")
async def create_withdrawal(withdrawal_data: WithdrawalRequest, current_user: UserResponse = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user.id})
    
    if withdrawal_data.amount > user["balance"]:
        raise HTTPException(status_code=400, detail="Saldo insuficiente")
    
    if withdrawal_data.amount < 10:
        raise HTTPException(status_code=400, detail="Monto mínimo de retiro es €10")
    
    # Format details based on method
    details_str = ""
    if withdrawal_data.method == "paypal":
        details_str = f"PayPal: {withdrawal_data.details.get('email')}"
    elif withdrawal_data.method == "bank":
        details_str = f"Banco: {withdrawal_data.details.get('bank_name')} - IBAN: {withdrawal_data.details.get('iban')}"
    elif withdrawal_data.method == "bizum":
        details_str = f"Bizum: {withdrawal_data.details.get('phone')}"
    
    transaction = Transaction(
        user_id=current_user.id,
        type="withdrawal",
        method=withdrawal_data.method.title(),
        amount=withdrawal_data.amount,
        details=details_str,
        status="pending"
    )
    
    await db.transactions.insert_one(transaction.dict())
    
    # Update user balance
    await db.users.update_one(
        {"id": current_user.id},
        {"$inc": {"balance": -withdrawal_data.amount}}
    )
    
    # Create notification for admin
    await create_notification(
        title="Solicitud de Retiro",
        message=f"{current_user.name} ha solicitado un retiro de €{withdrawal_data.amount} via {withdrawal_data.method.title()}",
        notification_type="withdrawal",
        user_id=current_user.id,
        data={
            "amount": withdrawal_data.amount,
            "method": withdrawal_data.method,
            "details": withdrawal_data.details,
            "transaction_id": transaction.id
        }
    )
    
    return {"message": "Retiro solicitado exitosamente", "transaction_id": transaction.id}

# Transaction routes
@api_router.get("/transactions", response_model=List[Transaction])
async def get_transactions(current_user: UserResponse = Depends(get_current_user)):
    transactions = await db.transactions.find({"user_id": current_user.id}).sort("created_at", -1).to_list(100)
    return [Transaction(**t) for t in transactions]

# Trading routes
@api_router.get("/trading/data")
async def get_trading_data():
    # Update trading data with random fluctuations
    for pair in trading_pairs:
        fluctuation = (random.random() - 0.5) * 100
        pair["value"] = max(1000, pair["value"] + fluctuation)
        pair["change"] = (random.random() - 0.5) * 10
        pair["direction"] = random.choice(["LONG", "SHORT"])
        pair["leverage"] = random.choice(["5x", "10x", "20x", "50x"])
    
    return {"pairs": trading_pairs, "last_updated": datetime.utcnow()}

# Admin routes
@api_router.get("/admin/stats")
async def get_admin_stats(current_user: UserResponse = Depends(get_admin_user)):
    total_users = await db.users.estimated_document_count()
    
    # Get total balance
    pipeline = [{"$group": {"_id": None, "total_balance": {"$sum": "$balance"}}}]
    result = await db.users.aggregate(pipeline).to_list(1)
    total_balance = result[0]["total_balance"] if result else 0
    
    return {
        "total_users": total_users,
        "total_balance": total_balance
    }

@api_router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(current_user: UserResponse = Depends(get_admin_user)):
    users = await db.users.find({}).to_list(100)
    return [UserResponse(**u) for u in users]

@api_router.put("/admin/users/{user_id}/balance")
async def update_user_balance(user_id: str, new_balance: float, current_user: UserResponse = Depends(get_admin_user)):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"balance": new_balance}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    user = await db.users.find_one({"id": user_id})
    
    # Create notification
    await create_notification(
        title="Balance Actualizado",
        message=f"El admin ha actualizado el balance de {user['name']} a €{new_balance}",
        notification_type="balance_update",
        user_id=user_id,
        data={
            "new_balance": new_balance,
            "user_name": user["name"]
        }
    )
    
    return {"message": "Balance actualizado exitosamente"}

@api_router.get("/admin/notifications", response_model=List[Notification])
async def get_notifications(current_user: UserResponse = Depends(get_admin_user)):
    notifications = await db.notifications.find({}).sort("created_at", -1).limit(50).to_list(50)
    return [Notification(**n) for n in notifications]

@api_router.put("/admin/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: UserResponse = Depends(get_admin_user)):
    result = await db.notifications.update_one(
        {"id": notification_id},
        {"$set": {"read": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    
    return {"message": "Notificación marcada como leída"}

@api_router.get("/wallet-addresses")
async def get_wallet_addresses():
    return WALLET_ADDRESSES

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()