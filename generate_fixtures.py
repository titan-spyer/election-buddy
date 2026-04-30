import json

with open('C:\\Users\\mrsat\\.gemini\\antigravity\\brain\\620f1408-d461-4386-a97c-63c165831a56\\.system_generated\\steps\\93\\content.md', 'r', encoding='utf-8') as f:
    # Read the file and skip the first 4 lines which contain the Source URL and '---'
    lines = f.readlines()[4:]
    data_str = ''.join(lines)
    
raw_data = json.loads(data_str)

django_fixtures = []
state_pk = 1
district_pk = 1

for state_obj in raw_data['states']:
    state_name = state_obj['state']
    
    # Create State fixture
    django_fixtures.append({
        "model": "guide.state",
        "pk": state_pk,
        "fields": {
            "name": state_name
        }
    })
    
    # Create District fixtures
    for district_name in state_obj['districts']:
        django_fixtures.append({
            "model": "guide.district",
            "pk": district_pk,
            "fields": {
                "state": state_pk,
                "name": district_name,
                "description": ""
            }
        })
        district_pk += 1
        
    state_pk += 1

with open('c:\\Users\\mrsat\\Documents\\Programming_Devloping\\my_DJango_project\\election-buddy\\data.json', 'w', encoding='utf-8') as f:
    json.dump(django_fixtures, f, indent=2)

print(f"Generated {state_pk-1} states and {district_pk-1} districts.")
