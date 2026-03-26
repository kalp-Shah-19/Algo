from fastapi import FastAPI
from app.api import routes_data

app = FastAPI()

app.include_router(routes_data.router)

@app.get("/")
def home():
    return {"message": "Algo Trading API is running :) "}

from fastapi.middleware.cors import CORSMiddleware
#cross origin resource sharing
#for sharing resources betw react and fastAPI

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)