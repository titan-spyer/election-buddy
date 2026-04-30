from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from .models import State, District, Constituency

# Get Gemini AI Key from settings
GEMINI_API_KEY = settings.GEMINI_API_KEY

def index(request):
    return render(request, 'guide/index.html', {'geminiApiKey': GEMINI_API_KEY})

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
    constituencies = Constituency.objects.filter(district_id=district_id).order_by('name')
    return JsonResponse(list(constituencies.values('id', 'name', 'constituency_type')), safe=False)
