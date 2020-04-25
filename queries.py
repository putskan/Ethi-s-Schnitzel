###################################################
#### Useful queries for the "answer" Database #####
###################################################

PERSONAL_CATEGORY_STATISTICS_QUERY = """
SELECT a.category, a.total_category_answers, ifnull(b.dominant_answers_for_category, 0) AS dominant_answers_for_category, CAST (ROUND(ifnull(b.dominant_answers_for_category, 0) * 1.0 / a.total_category_answers * 100) as INT) AS dominant_answers_percentage
FROM 
(
/* Get number of questions per category for the username */
SELECT category, count(*) AS total_category_answers
FROM answer
WHERE username = '{0}'
GROUP BY category 
) a
LEFT OUTER JOIN
(
/* Get number of dominant answers per category for the username */
SELECT category, count(*) AS dominant_answers_for_category
FROM answer
WHERE username = '{0}'
AND is_answer_category_dominant = 1
GROUP BY category
) b
ON a.category = b.category
"""

QUESTION_STATISTICS_QUERY = """
SELECT b.answer, CAST(ROUND(people_selected_this_answer * 1.0 / total_answers_to_question * 100) as INT) AS percentage_of_chosen_answer
FROM 
(
SELECT question_number, count(*) as total_answers_to_question
FROM answer
WHERE question_number = {0}
GROUP BY question_number
) a
INNER JOIN
(
SELECT question_number, answer, count(*) as people_selected_this_answer
FROM answer
WHERE question_number = {0}
GROUP BY question_number, answer
) b
ON a.question_number = b.question_number
"""

