import asyncio
import os
import bcrypt
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# Configuration
MONGO_URI = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client.asha_healthcare
workers_collection = db.workers

def get_password_hash(password: str):
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

async def create_new_worker(asha_id, name, village, raw_password):
    # Check if worker already exists
    existing = await workers_collection.find_one({"asha_id": asha_id})
    if existing:
        print(f"Error: Worker with ID {asha_id} already exists.")
        return

    hashed_password = get_password_hash(raw_password)
    
    new_worker = {
        "asha_id": asha_id,
        "name": name,
        "village": village,
        "password": hashed_password,
        "role": "worker",
        "must_change_password": True # Industry standard: Force change on first login
    }
    
    await workers_collection.insert_one(new_worker)
    print(f"Successfully created worker: {name} ({asha_id})")

if __name__ == "__main__":
    # Example Usage:
    # Run this via: python create_worker.py
    id_input = input("Enter ASHA ID: ")
    name_input = input("Enter Name: ")
    village_input = input("Enter Village: ")
    pass_input = input("Enter Temporary Password: ")
    
    asyncio.run(create_new_worker(id_input, name_input, village_input, pass_input))