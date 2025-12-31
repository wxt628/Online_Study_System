from pydantic import BaseModel

class LoginRequest(BaseModel):
	student_id: str
	password: str

class LoginResponse(BaseModel):
	token: str
	user_id: int
	student_id: str

class RegisterRequest(BaseModel):
	student_id: str
	password: str
	name: str
	phone: str
	email: str | None = None

class ResetPasswordRequest(BaseModel):
	student_id: str
	phone: str
	new_password: str
