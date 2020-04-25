import pandas
import numpy

def parse_questions_from_excel():
	excel_data = pandas.read_excel(r"C:\Users\Ben\Desktop\cyber\webDesign\CyberTyper\management\Dillemas.xlsx")
	# questions with metadata (category, category's related answer)
	questions_full = excel_data.values.tolist()
	# remove meta, to later send to JS
	questions_only = list(map(lambda question_list: question_list[0: 4], questions_full))
	print(questions_only)



parse_questions_from_excel()