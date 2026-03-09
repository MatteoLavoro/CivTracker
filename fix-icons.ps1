# Script per aggiungere icone automaticamente ai file di descrizione

$basePath = "d:\Matteo\Desktop\Progetti\CivTracker\CivTracker\public\CivDescrizioni"

# Funzione per processare un file
function Process-File {
    param($filePath)
    
    $content = [System.IO.File]::ReadAllText($filePath)
    $original = $content
    
    # Correzione errori comuni
    $content = $content -replace '\[StreghtIcon\]', '[StrengthIcon]'
    $content = $content -replace '\[ProductionIcon\] Forza di combattimento', '[StrengthIcon] Forza di combattimento'
    
    # Sostituzioni con doppi spazi
    $content = $content -replace '  Scienza', ' [ScienceIcon] Scienza'
    $content = $content -replace '  Cultura', ' [CultureIcon] Cultura'
    $content = $content -replace '  Fede', ' [FaithIcon] Fede'
    $content = $content -replace '  Cibo', ' [FoodIcon] Cibo'
    $content = $content -replace '  Produzione', ' [ProductionIcon] Produzione'
    $content = $content -replace '  Oro', ' [GoldIcon] Oro'
    $content = $content -replace '  Forza di combattimento', ' [StrengthIcon] Forza di combattimento'
    $content = $content -replace '  Forza religiosa', ' [ReligiousStrengthIcon] Forza religiosa'
    $content = $content -replace '  Turismo', ' [TourismIcon] Turismo'
    $content = $content -replace '  Abitazioni', ' [CitizenIcon] Abitazioni'
    $content = $content -replace '  Supporto diplomatico', ' [DiplomaticFavorIcon] Supporto diplomatico'
    $content = $content -replace '  Emissari', ' [EnvoyIcon] Emissari'
    $content = $content -replace '  Rotta commerciale', ' [TradeRouteIcon] Rotta commerciale'
    $content = $content -replace '  Rotte commerciali', ' [TradeRouteIcon] Rotte commerciali'
    $content = $content -replace '  capitale', ' [CapitalIcon] capitale'
    $content = $content -replace '  Capitale', ' [CapitalIcon] Capitale'
    $content = $content -replace '  Grande Profeta', ' [GreatProphetIcon] Grande Profeta'
    $content = $content -replace '  Grande Persona', ' [GreatPersonIcon] Grande Persona'
    $content = $content -replace '  Grande Scienziato', ' [ScientistIcon] Grande Scienziato'
    $content = $content -replace '  Grande Mercante', ' [MerchantIcon] Grande Mercante'
    $content = $content -replace '  Grande Generale', ' [GeneralIcon] Grande Generale'
    $content = $content -replace '  Movimento', ' [MovementIcon] Movimento'
    $content = $content -replace '  Energia', ' [PowerIcon] Energia'
    $content = $content -replace '  Cittadini', ' [CitizenIcon] Cittadini'
    $content = $content -replace '  Amenità', ' [AmenitiesIcon] Amenità'
    $content = $content -replace '  Attrattiva', ' [AmenitiesIcon] Attrattiva'
    $content = $content -replace '  Distretti', ' [DistrictIcon] Distretti'
    $content = $content -replace '  Distretto', ' [DistrictIcon] Distretto'
    $content = $content -replace '  Alleanza', ' [AllianceIcon] Alleanza'
    $content = $content -replace '  turno', ' [TurnIcon] turno'
    $content = $content -replace '  Lagnanze', ' [GrievancesIcon] Lagnanze'
    
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($filePath, $content)
        return $true
    }
    return $false
}

# Processa tutti i file
$files = Get-ChildItem -Path $basePath -Recurse -Filter "*.txt"
$count = 0

Write-Host "=== Processing Files ===" -ForegroundColor Cyan

foreach ($file in $files) {
    $modified = Process-File -filePath $file.FullName
    if ($modified) {
        Write-Host "✅ $($file.Name)" -ForegroundColor Green
        $count++
    } else {
        Write-Host "⏭️  $($file.Name)" -ForegroundColor Gray
    }
}

Write-Host "`n=== Done ===" -ForegroundColor Cyan
Write-Host "Modified: $count files" -ForegroundColor Yellow
Write-Host "`nNow go to /dev and run 'Seed Descrizioni Personaggi' and 'Seed Descrizioni Civiltà'" -ForegroundColor Cyan
