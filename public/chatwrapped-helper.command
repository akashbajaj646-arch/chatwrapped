#!/bin/bash

clear
echo ""
echo "  ╔═══════════════════════════════════════╗"
echo "  ║         ChatWrapped File Helper        ║"
echo "  ╚═══════════════════════════════════════╝"
echo ""

# Try to copy the file
cp ~/Library/Messages/chat.db ~/Desktop/chat.db 2>/dev/null

if [ $? -eq 0 ]; then
    echo "  ✅ Success! Your chat.db file has been"
    echo "     copied to your Desktop."
    echo ""
    echo "  Now go back to ChatWrapped and upload"
    echo "  the file from your Desktop."
    echo ""
    open ~/Desktop
else
    echo "  ⚠️  Permission needed!"
    echo ""
    echo "  This app needs Full Disk Access to read"
    echo "  your Messages database. Don't worry,"
    echo "  this is safe and required by Apple."
    echo ""
    echo "  Follow these steps:"
    echo ""
    echo "  1. A Settings window will open now"
    echo "  2. Click the + button"
    echo "  3. Go to Applications > Utilities"
    echo "  4. Select 'Terminal' and click Open"
    echo "  5. Toggle Terminal ON"
    echo "  6. Come back here and press Enter"
    echo ""

    # Open System Settings to Full Disk Access
    open "x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles"

    echo "  Press Enter after granting access..."
    read -r

    # Try again
    cp ~/Library/Messages/chat.db ~/Desktop/chat.db 2>/dev/null

    if [ $? -eq 0 ]; then
        echo ""
        echo "  ✅ Success! Your chat.db file has been"
        echo "     copied to your Desktop."
        echo ""
        echo "  Now go back to ChatWrapped and upload"
        echo "  the file from your Desktop."
        echo ""
        open ~/Desktop
    else
        echo ""
        echo "  ❌ Still no access. Try these steps:"
        echo ""
        echo "  1. Fully quit Terminal (Cmd+Q)"
        echo "  2. Reopen Terminal"
        echo "  3. Double-click this helper again"
        echo ""
    fi
fi

echo "  Press Enter to close..."
read -r
