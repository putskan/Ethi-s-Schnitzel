from flask import Flask, render_template, url_for, request, redirect
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from django.utils.safestring import mark_safe
from datetime import datetime
import json
import pandas
import numpy
import queries
DILLEMAS_EXCEL_FILEPATH = r'.\management\Dillemas.xlsx'

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///management/answers.db'
db = SQLAlchemy(app)


class Answer(db.Model):
    """
    SQLAlchemy class, used to handle the database
    """
    _id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    question_number = db.Column(db.Integer, nullable=False)
    question_content = db.Column(db.String(512), nullable=False)
    answer = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    # for instance, if the answer implies you're not keeping soldier's privacy in "Privacy" Category
    is_answer_category_dominant = db.Column(db.Boolean, nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return '<Answer %r>' % self._id



######################################################################################################
################################ BEGIN      <Flask Pages>       BEGIN ################################
######################################################################################################

@app.route('/')
def index():
    """
    Handles welcome page
    """
    return render_template('index.html', total_number_of_questions=total_number_of_questions)


@app.route('/questions')
def questions():
    """
    Handle the game itself (redirected from the welcome page)
    Send the question list to "questions.html", to be displayed there (using Javascript)
    """
    # recieve the "username" paramter sent from the login / welcome page
    client_username = request.args.get("username")
    # mark safe manages escaping and special letteres issues before sending data to render_template
    questions = mark_safe(questions_only)
    return render_template('questions.html', questionsRaw=questions, username=client_username)


@app.route('/submit/<username>', methods = ['GET', 'POST'])
def finish(username):
    """
    Recieve the answers, insert to Answer DB, redirect to the Personal Statistics page
    """
    if request.method == 'POST':
        # dict of the answers recieved, e.g {'1': 'A', '2': 'B', '3': 'C'}
        raw_answers = request.json
        for question_number, answer_selected in raw_answers.items():
            answer = (question_number, answer_selected)
            # parsing thw answers before inserting to DB
            parsed_answer = _parse_answer_before_db(answer, questions_with_meta)
            insert_answer_to_db(username, parsed_answer['question_number'], parsed_answer['answer_selected'], parsed_answer['category'], parsed_answer['is_answer_category_dominant'], parsed_answer['question_content'])

        return redirect("/personalStatistics/{0}".format(username), code=302)

    else:
        return "Wrong Page Pal..."


@app.route('/personalStatistics/<username>')
def personal_statistics(username):
    """
    Query DB and display personal statistics to the user
    """
    # The query returns stats for each category (each category is a tuple) - format:
        # [(Category, num_of_answers, num_of_category_dominant_answers, category_dominant_percentage), ...].
        # e.g -  [('Lying', 6, 4, 66), ('Privacy', 3, 2, 66), ...]
    personal_category_statistics_results = db.engine.execute(queries.PERSONAL_CATEGORY_STATISTICS_QUERY.format(username)).fetchall()
    return render_template('personalStatistics.html', username=username, personal_category_statistics_results=personal_category_statistics_results)


@app.route('/fullStatistics/<question_number>')
def full_statistics(question_number):
    """
    Query the DB and create piechart statistics for the whole group (using fullStatistics.html)
    Note: Piechart code was taken from web
    """
    # question_statistics_results - the answers distribution of a specific question (question_number).
        # e.g. - [('A', 40), ('B', 40), ('C', 20)]
    question_statistics_results = db.engine.execute(queries.QUESTION_STATISTICS_QUERY.format(question_number)).fetchall()
    return render_template('fullStatistics.html', question_number=int(question_number), answers_stats=question_statistics_results, total_number_of_questions=total_number_of_questions)

######################################################################################################
################################## END      <Flask Pages>       END ##################################
######################################################################################################



######################################################################################################
############################# BEGIN     <Helper Functions>      BEGIN ################################
######################################################################################################

def insert_answer_to_db(username, question_number, answer, category, is_answer_category_dominant, question_content):
    """
    Inserting answer to db
    """
    new_db_answer = Answer(username=username, question_number=question_number, answer=answer, category=category, is_answer_category_dominant=is_answer_category_dominant, question_content=question_content)
    db.session.add(new_db_answer)
    db.session.commit()
    return new_db_answer


def _parse_answer_before_db(answer, questions_with_meta):
    """
    :tuple answer: (question_number, answer_selected), e.g:  (1: B)
    :list questions_with_meta: [q1, q2, q3...], each "q" is a list - [:str: Q, :str: Answer1, :str: A2, :str: A3, :bool: category_strong_answer, :str: category], 

    return :list parsed_answer: the parsed answer, in the format needed in order to insert to DB
    """
    question_number = int(answer[0])
    # Why minus 1 ? Because the questions in the website starts from One, but questions_with_meta list starts from Zero 
    question_content = questions_with_meta[question_number - 1][0]
    is_answer_category_dominant = (questions_with_meta[question_number - 1][4].upper() == answer[1].upper())
    category = questions_with_meta[question_number - 1][5]
    return {'question_number': question_number, 'answer_selected': answer[1], 'category': category, 'is_answer_category_dominant': is_answer_category_dominant, 'question_content': question_content}
    # username parameter will be added later on


def parse_questions_from_excel(dillemas_excel_filepath):
    """
    :str: dillemas_excel_filepath - the path to the excel with the questions and possible answers

    Return:
    list:  excel_data: a list of list, containing each row from "dillemas_excel_filepath" file (not including headers)
            open the file for specifics.
    """
    excel_data = pandas.read_excel(dillemas_excel_filepath)
    return excel_data.values.tolist()

######################################################################################################
################################ END        <Helper Functions>      END ##############################
######################################################################################################


if __name__ == "__main__":
    """
    CyberTyper Game - a questionnaire for Intelligence Officer's Course
    """
    # questions with metadata (category, category's related answer)
    questions_with_meta = parse_questions_from_excel(DILLEMAS_EXCEL_FILEPATH)
    # remove meta (category, category's related answer), to later send to Javascript
    questions_only = list(map(lambda question_list: question_list[0: 4], questions_with_meta))
    total_number_of_questions = len(questions_only)
    app.run(host='0.0.0.0', port=1337, debug=True)

