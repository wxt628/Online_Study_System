from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from datetime import datetime
from src import database, storage
from src.schemas.course import CourseOut, AssignmentOut, SubmissionOut
from src.security import get_current_user
from src.dependencies import get_db

router = APIRouter()

@router.get("/courses", response_model=list[CourseOut])
def get_courses(
	semester: str | None = None,
	_: database.User = Depends(get_current_user),
	db: Session = Depends(get_db)
):
	query = db.query(database.Course)
	if semester:
		query = query.filter(database.Course.semester == semester)
	items = query.all()
	
	return [CourseOut(
        course_id=x.course_id, 
        course_code=x.course_code, 
        name=x.name, 
        teacher=x.teacher, 
        semester=x.semester 
    ) for x in items ]

@router.post("/courses/query", response_model=list[CourseOut])
def query_courses(
	payload: dict = Body(None),
	_: database.User = Depends(get_current_user),
	db: Session = Depends(get_db)
):
	semester = (payload or {}).get('semester')
	query = db.query(database.Course)
	if semester:
		query = query.filter(database.Course.semester == semester)
	items = query.all()
	return [CourseOut(
        course_id=x.course_id, 
        course_code=x.course_code, 
        name=x.name, 
        teacher=x.teacher, 
        semester=x.semester 
    ) for x in items ]

@router.get("/courses/{course_id}", response_model=CourseOut)
def get_course_detail(course_id: int, _: database.User = Depends(get_current_user), db: Session = Depends(get_db)):
	course = db.query(database.Course).filter(database.Course.course_id == course_id).first()
	if not course:
		raise HTTPException(status_code=401, detail={
			"error": { "message": "课程不存在" }
		})
	
	return CourseOut(
		course_id=course.course_id,
		course_code=course.course_code,
		name=course.name,
		teacher=course.teacher,
		semester=course.semester,
	)

@router.get("/courses/{course_id}/assignments", response_model=list[AssignmentOut])
def get_course_assignments(
	course_id: int,
	_: database.User = Depends(get_current_user),
	db: Session = Depends(get_db)
):
	# 1. 确认课程存在
	course = db.query(database.Course).filter(database.Course.course_id == course_id).first()
	if not course:
		raise HTTPException(
			status_code=404,
			detail={"error": {"message": "课程不存在"}}
		)

	# 2. 查询该课程的作业
	assignments = db.query(database.Assignment).filter(database.Assignment.course_id == course_id).order_by(database.Assignment.deadline).all()

	# 3. 返回作业列表
	return [AssignmentOut( 
        assignment_id=x.assignment_id, 
        course_id=x.course_id, 
        title=x.title, 
        description=x.description, 
        attachment_url=x.attachment_url, 
        deadline=str(x.deadline) if x.deadline else None, 
        created_at=str(x.created_at) if x.created_at else None
    ) for x in assignments ]

@router.get("/assignments/{assignment_id}", response_model=AssignmentOut)
def get_assignment(
	assignment_id: int,
	_: database.User = Depends(get_current_user),
	db: Session = Depends(get_db)
):
	x = db.query(database.Assignment).filter(database.Assignment.assignment_id == assignment_id).first()

	if not x:
		raise HTTPException(status_code=404, detail={"error": {"message": "作业不存在"}})
	return AssignmentOut( 
        assignment_id=x.assignment_id, 
        course_id=x.course_id, 
        title=x.title, 
        description=x.description, 
        attachment_url=x.attachment_url, 
        deadline=str(x.deadline) if x.deadline else None, 
        created_at=str(x.created_at) if x.created_at else None
    )

@router.post(
	"/assignments/{assignment_id}/submit",
	response_model=SubmissionOut
)
def submit_assignment(
	assignment_id: int,
	file: UploadFile = File(...),
	comment: str | None = Form(None),
	current_user: database.User = Depends(get_current_user),
	db: Session = Depends(get_db)
):
	assignment = db.query(database.Assignment).filter(database.Assignment.assignment_id == assignment_id).first()

	if not assignment:
		raise HTTPException(
			status_code=404,
			detail={"error": {"message": "作业不存在"}}
		)

	submission = database.Submission(
		assignment_id=assignment_id,
		user_id=current_user.user_id,
		comment=comment, # This might be a bug in original code, but preserving it.
		submitted_at=datetime.utcnow()
	)
	db.add(submission)
	db.commit()
	db.refresh(submission)

	# save submission file via storage helper
	file_url, size = storage.save_submission_file(file, submission.submission_id)
	submission.file_url = file_url
	db.commit()
	db.refresh(submission)

	return SubmissionOut(
		submission_id=submission.submission_id,
		assignment_id=submission.assignment_id,
		user_id=current_user.user_id,
		file_url=submission.file_url,
		submitted_at=submission.submitted_at,
		score=submission.score,
		feedback=submission.feedback
	)
