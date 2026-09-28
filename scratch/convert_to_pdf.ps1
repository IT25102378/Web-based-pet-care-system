$word = New-Object -ComObject Word.Application
$word.Visible = $false
try {
    $currentDir = Get-Location
    $docPath = Join-Path $currentDir "Y2S1_2026_Y2_S1_MTR_20_Testcases.docx"
    $pdfPath = Join-Path $currentDir "Y2S1_2026_Y2_S1_MTR_20_Testcases.pdf"
    
    $doc = $word.Documents.Open($docPath)
    $doc.ExportAsFixedFormat($pdfPath, 17)
    $doc.Close([ref]$false)
    Write-Host "SUCCESS: Generated $pdfPath"
} catch {
    Write-Host "ERROR: $_"
} finally {
    $word.Quit()
}
