$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$source = 'C:\Users\User\.codex\generated_images\01a10971-a311-7ff3-b12f-d14c2b1d859d\exec-47b63523-8280-47a9-ab79-efe863af5412.png'
$outputDirectory = Join-Path $PSScriptRoot 'assets'
$names = @('ceramics', 'linocut', 'mending', 'film', 'terrarium', 'bookbinding', 'candles', 'cyanotype')

New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
$image = [System.Drawing.Image]::FromFile($source)
$cellWidth = [int][math]::Floor($image.Width / 4)
$cellHeight = [int][math]::Floor($image.Height / 2)

try {
    for ($index = 0; $index -lt $names.Count; $index++) {
        $column = $index % 4
        $row = [int][math]::Floor($index / 4)
        $bitmap = [System.Drawing.Bitmap]::new($cellWidth, $cellHeight)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        try {
            $sourceRectangle = [System.Drawing.Rectangle]::new([int]($column * $cellWidth), [int]($row * $cellHeight), $cellWidth, $cellHeight)
            $destinationRectangle = [System.Drawing.Rectangle]::new(0, 0, $cellWidth, $cellHeight)
            $graphics.DrawImage($image, $destinationRectangle, $sourceRectangle, [System.Drawing.GraphicsUnit]::Pixel)
            $target = Join-Path $outputDirectory ($names[$index] + '.jpg')
            $bitmap.Save($target, [System.Drawing.Imaging.ImageFormat]::Jpeg)
        }
        finally {
            $graphics.Dispose()
            $bitmap.Dispose()
        }
    }
}
finally {
    $image.Dispose()
}
