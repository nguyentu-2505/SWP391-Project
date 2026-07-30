import os
import re

features_dir = r"c:\Users\Administrator\Documents\IdeaProjects\SWP391-Project\backend\src\main\java\com\example\swp\features"

for root, dirs, files in os.walk(features_dir):
    for file in files:
        if file.endswith(".java"):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            if "@Service" in content:
                # Check if @Transactional is already at the class level.
                # We look for @Transactional right before public class
                if not re.search(r'@Transactional(\(readOnly\s*=\s*true\))?\s*public class', content):
                    # It might be there but with some annotations in between.
                    # Let's just replace @Service with @Service \n @Transactional
                    # Only if class level @Transactional is missing
                    if not re.search(r'@Transactional[^\n]*\n(@[^\n]*\n)*public class', content):
                        print(f"Adding @Transactional to {file}")
                        
                        # ensure import
                        if "import org.springframework.transaction.annotation.Transactional;" not in content:
                            content = re.sub(r'package (.*?);\n', r'package \1;\n\nimport org.springframework.transaction.annotation.Transactional;\n', content, count=1)
                        
                        # replace @Service
                        content = re.sub(r'@Service', r'@Service\n@Transactional', content, count=1)
                        
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(content)
