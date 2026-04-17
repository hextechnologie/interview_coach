with open('app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

brace_count = 0
paren_count = 0
in_str = False
str_char = ''
in_template = 0

for i, line in enumerate(lines, 1):
    j = 0
    while j < len(line):
        c = line[j]
        if in_str:
            if c == '\\':
                j += 1
            elif c == str_char:
                in_str = False
        elif in_template > 0:
            if c == '`':
                in_template -= 1
            elif c == '$' and j+1 < len(line) and line[j+1] == '{':
                brace_count += 1
                j += 1
            elif c == '{':
                brace_count += 1
            elif c == '}':
                brace_count -= 1
        else:
            if c in ('"', "'"):
                in_str = True
                str_char = c
            elif c == '`':
                in_template += 1
            elif c == '{':
                brace_count += 1
            elif c == '}':
                brace_count -= 1
            elif c == '(':
                paren_count += 1
            elif c == ')':
                paren_count -= 1
        j += 1

print(f'Line {i}: braces={brace_count}, parens={paren_count}')
