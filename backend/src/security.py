from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import src.database as database

from datetime import datetime, timedelta
from jose import jwt

SECRET_KEY = "CHANGE_ME_TO_RANDOM_STRING"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(data: dict, expires_delta: timedelta | None = None):
	to_encode = data.copy()
	expire = datetime.utcnow() + (
		expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
	)
	to_encode.update({"exp": expire})
	return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

oauth2_scheme = OAuth2PasswordBearer(
	tokenUrl="/api/v1/auth/login"
)

def get_current_user(token: str = Depends(oauth2_scheme)):
	credentials_exception = HTTPException(
		status_code=status.HTTP_401_UNAUTHORIZED,
		detail="Could not validate credentials",
		headers={"WWW-Authenticate": "Bearer"},
	)

	try:
		payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
		student_id: str | None = payload.get("sub")
		if student_id is None:
			raise credentials_exception
	except JWTError:
		raise credentials_exception

	db = database.SessionLocal()
	try:
		user = (
			db.query(database.User)
			.filter(database.User.student_id == student_id)
			.first()
		)
		if user is None:
			raise credentials_exception
		return user
	finally:
		db.close()
