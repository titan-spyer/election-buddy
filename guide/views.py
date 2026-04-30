from django.shortcuts import render
from django.conf import settings

# Get Gemini AI Key from settings
GEMINI_API_KEY = settings.GEMINI_API_KEY

def index(request):
    return render(request, 'guide/index.html')

def process(request):
    # Fancy name: The Election Engine
    return render(request, 'guide/process.html', {'geminiApiKey': GEMINI_API_KEY})

def timeline(request):
    return render(request, 'guide/timeline.html', {'geminiApiKey': GEMINI_API_KEY})

def steps(request):
    return render(request, 'guide/steps.html', {'geminiApiKey': GEMINI_API_KEY})
