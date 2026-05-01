from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from .models import State, District, Constituency
import google.generativeai as genai
import json

# Get Gemini AI Key from settings
GEMINI_API_KEY = settings.GEMINI_API_KEY

def index(request):
    states = State.objects.all().order_by('name')
    return render(request, 'guide/index.html', {
        'states': states,
        'geminiApiKey': GEMINI_API_KEY
    })

def process(request):
    # Fancy name: The Election Engine
    return render(request, 'guide/process.html', {'geminiApiKey': GEMINI_API_KEY})

def timeline(request):
    return render(request, 'guide/timeline.html', {'geminiApiKey': GEMINI_API_KEY})

def steps(request):
    return render(request, 'guide/steps.html', {'geminiApiKey': GEMINI_API_KEY})

def constituency_lookup(request):
    states = State.objects.all().order_by('name')
    return render(request, 'guide/constituency.html', {
        'states': states,
        'geminiApiKey': GEMINI_API_KEY
    })

def api_districts(request):
    state_id = request.GET.get('state_id')
    if not state_id:
        return JsonResponse([])
    districts = District.objects.filter(state_id=state_id).order_by('name')
    return JsonResponse(list(districts.values('id', 'name')), safe=False)

def api_constituencies(request):
    district_id = request.GET.get('district_id')
    if not district_id:
        return JsonResponse([])
        
    try:
        district = District.objects.get(id=district_id)
        constituencies = Constituency.objects.filter(district_id=district_id).order_by('name')
        data = list(constituencies.values('id', 'name', 'constituency_type', 'representative', 'party'))
        
        if not data:
            # AI Fallback: Get the list from Gemini and SAVE to DB
            state_name = district.state.name
            district_name = district.name
            
            prompt = (
                f"List all assembly and parliamentary constituencies in the {district_name} district of {state_name}, India. "
                f"For each constituency, include: 'name', 'constituency_type' (Assembly or Parliamentary), "
                f"'representative' (Name of MLA if Assembly, MP if Parliamentary), and 'party'. "
                f"Return the response ONLY as a JSON array of objects. No other text."
            )
            
            genai.configure(api_key=GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-flash-latest')
            response = model.generate_content(prompt)
            
            raw_text = response.text.strip()
            if "```json" in raw_text:
                raw_text = raw_text.split("```json")[1].split("```")[0].strip()
            elif "```" in raw_text:
                raw_text = raw_text.split("```")[1].split("```")[0].strip()
                
            ai_data = json.loads(raw_text)
            
            # Save to DB for persistence
            for item in ai_data:
                Constituency.objects.update_or_create(
                    district=district,
                    name=item['name'],
                    constituency_type=item['constituency_type'],
                    defaults={
                        'representative': item.get('representative'),
                        'party': item.get('party')
                    }
                )
            
            # Re-fetch with fresh data
            constituencies = Constituency.objects.filter(district_id=district_id).order_by('name')
            data = list(constituencies.values('id', 'name', 'constituency_type', 'representative', 'party'))
            for item in data:
                item['is_ai'] = True # Mark as freshly generated for the UI
                
        return JsonResponse(data, safe=False)
    except Exception as e:
        print(f"Error in api_constituencies: {e}")
        return JsonResponse([], safe=False)
def api_ai_constituency(request):
    state_name = request.GET.get('state')
    district_name = request.GET.get('district')
    
    if not state_name or not district_name:
        return JsonResponse({'error': 'State and District are required'}, status=400)
        
    try:
        # Try to fetch from database first
        district = District.objects.filter(name__iexact=district_name, state__name__iexact=state_name).first()
        if district:
            consts = Constituency.objects.filter(district=district)
            if consts.exists():
                mla = consts.filter(constituency_type='Assembly').first()
                mp = consts.filter(constituency_type='Parliamentary').first()
                if mla and mp:
                    return JsonResponse({
                        'mla_name': mla.representative,
                        'mla_party': mla.party,
                        'assembly_constituency': mla.name,
                        'mp_name': mp.representative,
                        'mp_party': mp.party,
                        'parliamentary_constituency': mp.name,
                        'source': 'database'
                    })

        # If not found or incomplete, generate with AI
        prompt = (
            f"Identify the current Member of Parliament (MP) and Member of Legislative Assembly (MLA) for the {district_name} region in {state_name}, India. "
            f"Provide the names of the representatives and their political parties. "
            f"Return the response ONLY as a JSON object with these keys: "
            f"'mp_name', 'mp_party', 'mla_name', 'mla_party', 'assembly_constituency', 'parliamentary_constituency'. "
            f"If multiple MLAs exist in the district, provide the one for the district headquarters or a prominent one. "
            f"No other text or markdown."
        )
        
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content(prompt)
        
        raw_text = response.text.strip()
        if "```json" in raw_text:
            raw_text = raw_text.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_text:
            raw_text = raw_text.split("```")[1].split("```")[0].strip()
            
        data = json.loads(raw_text)
        
        # Save to database if district exists
        if district:
            # Save MP
            Constituency.objects.update_or_create(
                district=district,
                name=data['parliamentary_constituency'],
                constituency_type='Parliamentary',
                defaults={'representative': data['mp_name'], 'party': data['mp_party']}
            )
            # Save MLA
            Constituency.objects.update_or_create(
                district=district,
                name=data['assembly_constituency'],
                constituency_type='Assembly',
                defaults={'representative': data['mla_name'], 'party': data['mla_party']}
            )
            
        return JsonResponse(data)
    except Exception as e:
        print(f"Error in api_ai_constituency: {e}")
        return JsonResponse({'error': str(e)}, status=500)
