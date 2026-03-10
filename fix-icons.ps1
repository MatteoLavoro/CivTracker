# Script per aggiungere icone automaticamente ai file di descrizione

$basePath = "d:\Matteo\Desktop\Progetti\CivTracker\CivTracker\public\CivDescrizioni"

# Funzione per processare un file
function Process-File {
    param($filePath)
    
    $content = [System.IO.File]::ReadAllText($filePath)
    $original = $content
    
    # Step 1: Fix incorrect icons that might exist
    $content = $content -replace '\[StreghtIcon\]', '[StrengthIcon]'
    $content = $content -replace '\[ProductionIcon\] Forza di combattimento', '[StrengthIcon] Forza di combattimento'
    $content = $content -replace '\[ProductionIcon\] Forza religiosa', '[ReligiousStrengthIcon] Forza religiosa'
    $content = $content -replace '\[GoldIcon\] Rotta commerciale', '[TradeRouteIcon] Rotta commerciale'
    $content = $content -replace '\[GoldIcon\] Rotte commerciali', '[TradeRouteIcon] Rotte commerciali'
    $content = $content -replace '\[DiplomaticFavorIcon\] Emissari', '[EnvoyIcon] Emissari'
    $content = $content -replace '\[GreatPersonIcon\] Grande Profeta', '[GreatProphetIcon] Grande Profeta'
    $content = $content -replace '\[CultureIcon\] Turismo', '[TourismIcon] Turismo'
    
    # Step 2: Remove duplicate icons (e.g., "[Icon] [Icon] Word" -> "[Icon] Word")
    $content = $content -replace '(\[[A-Z][a-zA-Z]+Icon\])\s*\1', '$1'
    
    # Step 3: Apply replacements only where icons don't already exist
    # Risorse base
    $content = $content -replace '(?<!\])\s{2,}Scienza(?!\])', ' [ScienceIcon] Scienza'
    $content = $content -replace '(?<!\])\s{2,}Cultura(?!\])', ' [CultureIcon] Cultura'
    $content = $content -replace '(?<!\])\s{2,}Fede(?!\])', ' [FaithIcon] Fede'
    $content = $content -replace '(?<!\])\s{2,}Cibo(?!\])', ' [FoodIcon] Cibo'
    $content = $content -replace '(?<!\])\s{2,}Produzione(?!\])', ' [ProductionIcon] Produzione'
    $content = $content -replace '(?<!\])\s{2,}Oro(?!\])', ' [GoldIcon] Oro'
    $content = $content -replace '(?<!\])\s{2,}Turismo(?!\])', ' [TourismIcon] Turismo'
    
    # Risorse strategiche
    $content = $content -replace '(?<!\])\s{2,}Ferro(?!\])', ' [IronIcon] Ferro'
    $content = $content -replace '(?<!\])\s{2,}Carbone(?!\])', ' [CoalIcon] Carbone'
    $content = $content -replace '(?<!\])\s{2,}Petrolio(?!\])', ' [OilIcon] Petrolio'
    $content = $content -replace '(?<!\])\s{2,}Alluminio(?!\])', ' [AluminumIcon] Alluminio'
    $content = $content -replace '(?<!\])\s{2,}Uranio(?!\])', ' [UraniumIcon] Uranio'
    
    # Combattimento
    $content = $content -replace '(?<!\])\s{2,}Forza di combattimento(?!\])', ' [StrengthIcon] Forza di combattimento'
    $content = $content -replace '(?<!\])\s{2,}Forza religiosa(?!\])', ' [ReligiousStrengthIcon] Forza religiosa'
    $content = $content -replace '(?<!\])\s{2,}Movimento(?!\])', ' [MovementIcon] Movimento'
    $content = $content -replace '(?<!\])\s{2,}Promozione(?!\])', ' [PromotionIcon] Promozione'
    $content = $content -replace '(?<!\])\s{2,}Promozioni(?!\])', ' [PromotionIcon] Promozioni'
    
    # Città e popolazione
    $content = $content -replace '(?<!\])\s{2,}Abitazioni(?!\])', ' [CitizenIcon] Abitazioni'
    $content = $content -replace '(?<!\])\s{2,}Cittadini(?!\])', ' [CitizenIcon] Cittadini'
    $content = $content -replace '(?<!\])\s{2,}Amenità(?!\])', ' [AmenitiesIcon] Amenità'
    $content = $content -replace '(?<!\])\s{2,}Attrattiva(?!\])', ' [AmenitiesIcon] Attrattiva'
    $content = $content -replace '(?<!\])\s{2,}capitale(?!\])', ' [CapitalIcon] capitale'
    $content = $content -replace '(?<!\])\s{2,}Capitale(?!\])', ' [CapitalIcon] Capitale'
    $content = $content -replace '(?<!\])\s{2,}Distretti(?!\])', ' [DistrictIcon] Distretti'
    $content = $content -replace '(?<!\])\s{2,}Distretto(?!\])', ' [DistrictIcon] Distretto'
    
    # Diplomazia
    $content = $content -replace '(?<!\])\s{2,}Supporto diplomatico(?!\])', ' [DiplomaticFavorIcon] Supporto diplomatico'
    $content = $content -replace '(?<!\])\s{2,}Emissari(?!\])', ' [EnvoyIcon] Emissari'
    $content = $content -replace '(?<!\])\s{2,}Alleanza(?!\])', ' [AllianceIcon] Alleanza'
    $content = $content -replace '(?<!\])\s{2,}Lagnanze(?!\])', ' [GrievancesIcon] Lagnanze'
    
    # Commercio
    $content = $content -replace '(?<!\])\s{2,}Rotte commerciali(?!\])', ' [TradeRouteIcon] Rotte commerciali'
    $content = $content -replace '(?<!\])\s{2,}Rotta commerciale(?!\])', ' [TradeRouteIcon] Rotta commerciale'
    $content = $content -replace '(?<!\])\s{2,}Emporio commerciale(?!\])', ' [TradingPostIcon] Emporio commerciale'
    $content = $content -replace '(?<!\])\s{2,}Empori commerciali(?!\])', ' [TradingPostIcon] Empori commerciali'
    
    # Grandi Persone
    $content = $content -replace '(?<!\])\s{2,}Grande Profeta(?!\])', ' [GreatProphetIcon] Grande Profeta'
    $content = $content -replace '(?<!\])\s{2,}Grande Persona(?!\])', ' [GreatPersonIcon] Grande Persona'
    $content = $content -replace '(?<!\])\s{2,}Grande Scienziato(?!\])', ' [ScientistIcon] Grande Scienziato'
    $content = $content -replace '(?<!\])\s{2,}Grande Mercante(?!\])', ' [MerchantIcon] Grande Mercante'
    $content = $content -replace '(?<!\])\s{2,}Grande Generale(?!\])', ' [GeneralIcon] Grande Generale'
    
    # Meccaniche speciali
    $content = $content -replace '(?<!\])\s{2,}Eureka(?!\])', ' [EurekaIcon] Eureka'
    $content = $content -replace '(?<!\])\s{2,}eureka(?!\])', ' [EurekaIcon] eureka'
    $content = $content -replace '(?<!\])\s{2,}Ispirazione(?!\])', ' [InspirationIcon] Ispirazione'
    $content = $content -replace '(?<!\])\s{2,}ispirazione(?!\])', ' [InspirationIcon] ispirazione'
    $content = $content -replace '(?<!\])\s{2,}cariche(?!\])', ' [BuildChargesIcon] cariche'
    
    # Cultura e opere
    $content = $content -replace '(?<!\])\s{2,}Reliquia(?!\])', ' [RelicIcon] Reliquia'
    $content = $content -replace '(?<!\])\s{2,}Reliquie(?!\])', ' [RelicIcon] Reliquie'
    $content = $content -replace '(?<!\])\s{2,}Grande opera d''arte(?!\])', ' [GreatWorkArtIcon] Grande opera d''arte'
    $content = $content -replace '(?<!\])\s{2,}Grande opera musicale(?!\])', ' [GreatWorkMusicIcon] Grande opera musicale'
    $content = $content -replace '(?<!\])\s{2,}Grande opera letteraria(?!\])', ' [GreatWorkWritingIcon] Grande opera letteraria'
    
    # Altro
    $content = $content -replace '(?<!\])\s{2,}Energia(?!\])', ' [PowerIcon] Energia'
    $content = $content -replace '(?<!\])\s{2,}turno(?!\])', ' [TurnIcon] turno'
    
    # Step 4: Clean up multiple spaces before icons (e.g., "alla  [Icon]" -> "alla [Icon]")
    $content = $content -replace '\s{2,}(\[[A-Z][a-zA-Z]+Icon\])', ' $1'
    
    # Step 5: Clean up any triple+ spaces (but preserve newlines)
    $content = $content -replace ' {3,}', ' '
    
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
