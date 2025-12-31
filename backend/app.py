from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from src import database
from src.routers import auth, user, mini_program, course, post, notification

app = FastAPI(title="Campus Platform API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://172.28.172.81:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files in development: expose /uploads/... paths
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Ensure any new tables are created
try:
    database.Base.metadata.create_all(bind=database.engine)
except Exception:
    pass

app.include_router(auth.router,         prefix="/api/v1", tags=["Auth"])
app.include_router(user.router,         prefix="/api/v1", tags=["User"])
app.include_router(mini_program.router, prefix="/api/v1", tags=["MiniProgram"])
app.include_router(course.router,       prefix="/api/v1", tags=["Course"])
app.include_router(post.router,         prefix="/api/v1", tags=["Post"])
app.include_router(notification.router, prefix="/api/v1", tags=["Notification"])
