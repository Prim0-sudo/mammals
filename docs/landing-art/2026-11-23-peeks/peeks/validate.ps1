Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;using System.Drawing;using System.IO;
public static class VerifyPeeks {
public static void Run(string root){int count=0;foreach(var animal in new[]{"rabbit","fox","badger","mouse","hedgehog"})using(var m=new Bitmap(Path.Combine(root,animal+"-ahead.png"))){foreach(var pose in new[]{"ahead","left","right","blink",animal=="rabbit"?"ears":animal=="mouse"?"whiskers":"sniff"}){string n=animal+"-"+pose;using(var b=new Bitmap(Path.Combine(root,n+".png"))){if(b.Width!=512||b.Height!=512)throw new Exception(n+" size");int diffs=0,bottom=0,partial=0,top=512;for(int y=0;y<512;y++)for(int x=0;x<512;x++){int a=b.GetPixel(x,y).A;if(y>=452&&a>0)bottom++;if(a>0&&a<255)partial++;if(a>100)top=Math.Min(top,y);if(a!=m.GetPixel(x,y).A)diffs++;}if(bottom>0||partial==0)throw new Exception(n+" alpha");Console.WriteLine(n+": RGBA, top="+top+", bottom60=transparent, mask differences="+diffs);count++;}}}Console.WriteLine("Verified "+count+" sprites");}}
'@
[VerifyPeeks]::Run($PSScriptRoot)
