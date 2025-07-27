@echo off
echo === SUPPRESSION FORCEE ET BUILD ===
echo.
echo Tentative de suppression du dossier dist...
if exist dist (
    echo Dossier dist trouve, suppression en cours...
    attrib -r -h -s dist\*.* /s /d
    rmdir /s /q dist
    if exist dist (
        echo Echec de la suppression normale, tentative avec takeown...
        takeown /f dist /r /d y
        icacls dist /grant administrators:F /t
        rmdir /s /q dist
    )
)

if not exist dist (
    echo Dossier dist supprime avec succes !
) else (
    echo Impossible de supprimer le dossier dist.
)

echo.
echo Lancement du build...
npm run build

echo.
echo === TERMINE ===
pause
