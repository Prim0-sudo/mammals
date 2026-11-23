Add-Type -AssemblyName System.Drawing
$code = @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
public static class PeekPrep {
 public static Bitmap Scale(string path) {
  using(var src=new Bitmap(path)) {var b=new Bitmap(512,512,PixelFormat.Format32bppArgb);using(var g=Graphics.FromImage(b)){g.CompositingMode=CompositingMode.SourceCopy;g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.DrawImage(src,0,0,512,512);}return b;}
 }
 public static Bitmap Align(Bitmap s,Bitmap master,string animal,string pose,out string stats) {
  int bx=0,by=0; double best=double.MaxValue;
  if(pose!="ahead") for(int dy=-8;dy<=8;dy++)for(int dx=-8;dx<=8;dx++) {
   double err=0; for(int y=25;y<210;y+=4)for(int x=35;x<477;x+=4){int a=master.GetPixel(x,y).A;int v=s.GetPixel(x-dx,y-dy).A;err+=Math.Abs(a-v);}
   if(err<best){best=err;bx=dx;by=dy;}
  }
  int top=512,left=512,right=0;
  for(int y=0;y<450;y++)for(int x=0;x<512;x++)if(master.GetPixel(x,y).A>100){top=Math.Min(top,y);left=Math.Min(left,x);right=Math.Max(right,x);}
  int ty=60-top,tx=256-(left+right)/2;
  double start=animal=="rabbit"?340:animal=="badger"?315:animal=="mouse"?315:300;
  double end=animal=="rabbit"?448:animal=="badger"?440:animal=="mouse"?440:430;
  var o=new Bitmap(512,512,PixelFormat.Format32bppArgb);
  for(int y=0;y<452;y++)for(int x=0;x<512;x++){
   int mx=x-tx,my=y-ty,sx=mx-bx,sy=my-by;
   if(mx<0||mx>=512||my<0||my>=512||sx<0||sx>=512||sy<0||sy>=512)continue;
   Color c=s.GetPixel(sx,sy);int alpha=master.GetPixel(mx,my).A;
   if(animal=="rabbit"&&pose=="ears"&&my<205)alpha=c.A;
   double t=Math.Max(0,Math.Min(1,(y-start)/(end-start))); double fade=1-t*t*(3-2*t);
   alpha=(int)Math.Round(Math.Max(0,(alpha-3)*255.0/252)*fade); if(alpha<3)continue;
   if(c.A<20){bool found=false;for(int rad=1;rad<=12&&!found;rad++)for(int oy=-rad;oy<=rad&&!found;oy++)for(int ox=-rad;ox<=rad;ox++){int xx=sx+ox,yy=sy+oy;if(xx<0||yy<0||xx>=512||yy>=512)continue;Color n=s.GetPixel(xx,yy);if(n.A>100){c=n;found=true;break;}}if(!found)c=master.GetPixel(mx,my);}
   o.SetPixel(x,y,Color.FromArgb(alpha,c.R,c.G,c.B));
  }
  stats="shift="+bx+","+by+"; placement="+tx+","+ty;return o;
 }
 public static void Sheet(string[] paths,string[] names,string output,Color bg) {
  using(var b=new Bitmap(1400,1500,PixelFormat.Format32bppArgb)) using(var g=Graphics.FromImage(b)) using(var font=new Font("Arial",15)) {
   g.Clear(bg); for(int i=0;i<paths.Length;i++){using(var s=new Bitmap(paths[i]))g.DrawImage(s,(i%5)*280,(i/5)*300,280,280);g.DrawString(names[i],font,Brushes.White,(i%5)*280+12,(i/5)*300+277);} b.Save(output,ImageFormat.Png);
  }
 }
}
'@
Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing
$srcs=Get-Content "$PSScriptRoot/sources.json" | ConvertFrom-Json
$names=@(); $paths=@()
foreach($p in $srcs.PSObject.Properties){$parts=$p.Name.Split('-');$animal=$parts[0];$pose=$parts[1];$b=[PeekPrep]::Scale($p.Value);$master=[PeekPrep]::Scale($srcs."$animal-ahead");$stats='';$aligned=[PeekPrep]::Align($b,$master,$animal,$pose,[ref]$stats);$path="$PSScriptRoot/$($p.Name).png";$aligned.Save($path,[System.Drawing.Imaging.ImageFormat]::Png);$aligned.Dispose();$master.Dispose();$b.Dispose();$names+=$p.Name;$paths+=$path;Write-Output "$($p.Name): $stats"}
[PeekPrep]::Sheet($paths,$names,"$PSScriptRoot/contact-sheet.png",[System.Drawing.Color]::FromArgb(100,132,85))
[PeekPrep]::Sheet($paths,$names,"$PSScriptRoot/check-black.png",[System.Drawing.Color]::Black)
[PeekPrep]::Sheet($paths,$names,"$PSScriptRoot/check-white.png",[System.Drawing.Color]::White)

