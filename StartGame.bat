@echo off
echo.
echo ### CMD ### For any help, call 052-7457479
echo.


setlocal
:PROMPT
SET "TODELETE=N"
SET /P TODELETE=### CMD ### Would you like to delete the previous run's answers? (Y/[N])? 
IF /I "%TODELETE%" NEQ "Y" GOTO NODELETE


echo.
echo ### CMD ### Deleting Previous Run's Answers From DB 
echo.
.\env\Scripts\python.exe delete_db_data.py
echo.
GOTO RUNGAME


:NODELETE
echo.
echo ### CMD ### *NOT* Deleting Previous Run's Answers From DB
echo.


:RUNGAME
echo ### CMD ### Running the app from the virtualEnv python
echo.
call .\env\Scripts\python.exe app.py
echo.
endlocal