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
                # check for class level @Transactional
                # usually it's @Transactional\npublic class or @Transactional(readOnly = true)\n@RequiredArgsConstructor\npublic class
                has_class_level = re.search(r'@Transactional[\s\S]*?public class', content)
                if not has_class_level:
                    print(f"MISSING: {file}")
                else:
                    print(f"OK: {file}")
