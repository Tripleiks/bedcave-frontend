#!/bin/bash
# Vercel Deployment für Bedcave

echo "╔════════════════════════════════════════════════════════╗"
echo "║  Bedcave → Vercel Deployment                           ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if logged in
if ! vercel whoami &>/dev/null; then
    echo "🔐 Bitte bei Vercel einloggen:"
    echo ""
    vercel login
    echo ""
fi

# Deploy
echo "🚀 Starte Deployment..."
echo ""
vercel --yes --prod

echo ""
echo "✅ Deployment abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Domain in Vercel Dashboard hinzufügen"
echo "2. DNS bei Strato auf Vercel umstellen"
echo ""
