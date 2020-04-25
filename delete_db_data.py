"""
Used to initialize answers.db (delete all past records)
"""
try:
	print('\n*****  <Python> Deleting Records From DB...   *****\n')
	from app import *
	db.session.query(Answer).delete()
	db.session.commit()
	print('\n\n*****   <Python> Deleted DB Records Successfully! :-)   *****\n')

except Exception as e:
	print('\n*****   <Python> NOTICE: Deleting Previous Records From DB FAILED!   *****\n*****   <Python> Reason: {0}   *****\n\n'.format(str(e)))

"""
Note -
To Delete Specific User's Records:
db.session.query(Answer).filter(Answer.username == 123).delete()
(Or You Can Access Via a GUI - e.g Sqlite Browser)
"""
