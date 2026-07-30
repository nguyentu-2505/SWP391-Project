import os
import re

features_dir = r"c:\Users\Administrator\Documents\IdeaProjects\SWP391-Project\backend\src\main\java\com\example\swp\features"

missing = []

for root, dirs, files in os.walk(features_dir):
    for file in files:
        if file.endswith(".java"):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            if "@Service" in content:
                if not re.search(r'@Transactional', content):
                    missing.append(file)
                else:
                    # check if @Transactional is before public class
                    if not re.search(r'@Transactional[^\n]*\n(@[^\n]*\n)*public class', content):
                        print(f"Warning: {file} has @Transactional but not at class level")

print("Files missing @Transactional entirely:")
print(missing)
