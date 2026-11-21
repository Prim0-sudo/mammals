// Code-native control marks: stable geometry, no platform-dependent emoji.
export const iconPaths = {
 sound:'<path d="M8 19H3V11H8L16 5V25L8 19Z" fill="#a8c984"/><path d="M21 10Q27 15 21 20M25 6Q35 15 25 24"/>',
 muted:'<path d="M8 19H3V11H8L16 5V25L8 19Z" fill="#a8c984"/><path d="M22 11L30 19M30 11L22 19"/>',
 pause:'<rect x="8" y="5" width="5" height="22" rx="2" fill="#a8c984"/><rect x="20" y="5" width="5" height="22" rx="2" fill="#a8c984"/>',
 play:'<path d="M10 5L27 16L10 27Z" fill="#a8c984"/>',
 fullscreen:'<path d="M4 12V4H12M21 4H29V12M29 21V29H21M12 29H4V21"/>',
 collapse:'<path d="M12 4V12H4M29 12H21V4M21 29V21H29M4 21H12V29"/>',
 learn:'<path d="M16 27V13M16 18C4 20 3 8 3 8C15 6 16 18 16 18ZM16 13C17 3 29 4 29 4C28 16 16 13 16 13Z" fill="#a8c984"/><path d="M6 28Q16 23 26 28"/>',
 sort:'<path d="M5 15H28L25 28H8Z" fill="#d8c19a"/><path d="M10 15Q16 1 23 15M10 21H24"/><path d="M7 8L10 3L13 8ZM22 8L25 3L28 8Z" fill="#a8c984"/>',
 detective:'<circle cx="13" cy="13" r="9" fill="#d9ece6"/><path d="M20 20L29 29M13 18V9M13 13Q6 13 8 8Q15 8 13 13ZM13 13Q20 12 18 7Q12 8 13 13Z"/>',
 identify:'<rect x="3" y="5" width="21" height="22" rx="3" fill="#d9ece6"/><path d="M7 21L12 15L17 19M19 24L23 28L30 18"/><circle cx="17" cy="11" r="2" fill="#e2bc5b"/>',
 knowledge:'<path d="M10 23C10 18 5 17 5 11A11 11 0 0 1 27 11C27 17 22 18 22 23Z" fill="#eddb93"/><path d="M11 27H21M13 31H19M16 22V13M12 13L16 17L20 13"/>',
 spelling:'<ellipse cx="16" cy="15" rx="14" ry="5" fill="#b0d9d3"/><path d="M8 13C8 1 24 1 24 13M10 23L8 29M16 24V30M22 23L24 29"/><circle cx="10" cy="16" r="1"/><circle cx="22" cy="16" r="1"/>',
 flip:'<rect x="3" y="4" width="17" height="23" rx="3" fill="#d9ece6"/><rect x="13" y="8" width="17" height="23" rx="3" fill="#e5eac0"/><path d="M21 26V16M21 20C15 20 15 14 15 14C21 13 21 20 21 20ZM21 20C27 20 28 14 28 14C22 13 21 20 21 20Z"/>',
 wheel:'<circle cx="16" cy="17" r="12" fill="#e5eac0"/><path d="M16 5V29M4 17H28M8 8L24 26M7 25L25 9M12 1L16 6L20 1"/><circle cx="16" cy="17" r="3" fill="#d9ece6"/>',
 book:'<path d="M16 8Q10 3 3 6V27Q10 24 16 29Q22 24 29 27V6Q22 3 16 8Z" fill="#e5eac0"/><path d="M16 8V29M7 12L12 13M7 17L12 18M21 12L25 11M21 17L25 16"/>',
 video:'<rect x="3" y="6" width="26" height="21" rx="4" fill="#d9ece6"/><path d="M13 12L21 17L13 22Z" fill="#a8c984"/>',
 music:'<path d="M12 23V6L27 3V20M12 12L27 9"/><ellipse cx="8" cy="25" rx="5" ry="4" fill="#a8c984"/><ellipse cx="23" cy="22" rx="5" ry="4" fill="#a8c984"/>',
 media:'<path d="M3 8Q9 5 15 9Q21 5 27 8V28Q21 25 15 29Q9 25 3 28Z" fill="#e5eac0"/><path d="M15 9V29M21 3V13M21 3L29 1V10"/><circle cx="19" cy="14" r="2" fill="#a8c984"/><circle cx="27" cy="11" r="2" fill="#a8c984"/>',
 phonics:'<path d="M3 26L9 6L15 26M5 19H13M28 16C18 7 16 32 28 24M28 13V27"/>',
 create:'<path d="M3 5H21V29H3Z" fill="#e5eac0"/><path d="M12 22L14 16L26 4L30 8L18 20Z" fill="#eddb93"/><path d="M23 7L27 11M8 25H17"/>',
 garden:'<path d="M4 20H28L25 30H7Z" fill="#d8c19a"/><path d="M16 20V8M16 13C5 13 5 3 5 3C15 2 16 13 16 13ZM16 10C17 1 29 3 29 3C27 13 16 10 16 10Z" fill="#a8c984"/>',
 undo:'<path d="M12 7L5 13L12 19M5 13H21Q29 13 29 21Q29 28 21 28H14"/>',
 restart:'<path d="M6 13A12 12 0 1 1 6 23M6 4V13H15"/>',
 check:'<path d="M5 17L12 25L28 7"/>',
 soil:'<path d="M3 24Q10 6 16 17Q24 1 30 24Z" fill="#d8c19a"/><path d="M7 28H27M10 22H11M21 20H22M17 25H18"/>',
 seed:'<path d="M25 4C9 0 0 19 9 27C22 37 34 13 25 4Z" fill="#e7d5a7"/><path d="M20 10Q12 13 12 22"/>',
 water:'<path d="M16 2C12 9 4 17 5 23C7 35 27 34 28 22C28 15 19 6 16 2Z" fill="#b0d9df"/><path d="M10 20Q9 25 14 26"/>',
 sun:'<circle cx="16" cy="16" r="7" fill="#eddb93"/><path d="M16 1V5M16 27V31M1 16H5M27 16H31M5 5L8 8M24 24L27 27M5 27L8 24M24 8L27 5"/>',
 observe:'<path d="M2 16Q16 1 30 16Q16 31 2 16Z" fill="#d9ece6"/><circle cx="16" cy="16" r="5" fill="#a8c984"/>',
 stop:'<rect x="7" y="7" width="19" height="19" rx="2" fill="#d8c19a"/>',
 next:'<path d="M11 5L23 16L11 27"/>',
 previous:'<path d="M22 5L10 16L22 27"/>',
 back:'<path d="M14 6L4 16L14 26M5 16H30"/>',
 games:'<rect x="3" y="3" width="11" height="11" rx="3" fill="#e5eac0"/><rect x="20" y="3" width="11" height="11" rx="3" fill="#eddb93"/><rect x="3" y="20" width="11" height="11" rx="3" fill="#d9ece6"/><rect x="20" y="20" width="11" height="11" rx="3" fill="#e7d5a7"/>',
 filter:'<path d="M4 8H30M4 17H30M4 26H30"/><circle cx="11" cy="8" r="3" fill="#a8c984"/><circle cx="23" cy="17" r="3" fill="#eddb93"/><circle cx="14" cy="26" r="3" fill="#b0d9d3"/>',
 clear:'<path d="M8 8L26 26M26 8L8 26"/><circle cx="17" cy="17" r="14"/>',
 letters:'<path d="M3 27L10 6L17 27M6 19H14M22 8V27M22 8H26Q33 8 29 15Q34 22 27 27H22"/>',
 blend:'<path d="M3 9H11M7 5L11 9L7 13M31 9H23M27 5L23 9L27 13M10 19Q17 13 24 19L21 30H13Z" fill="#e5eac0"/><path d="M17 17V11M17 14Q11 14 11 9M17 14Q23 14 23 9"/>',
 vowels:'<path d="M5 11Q14 7 14 16V26M14 18Q4 13 4 23Q5 30 14 23M22 10V23Q22 30 30 25M30 10V27"/><path d="M5 4H13M22 4H30"/>',
 reading:'<path d="M17 10Q10 5 3 8V29Q10 26 17 31Q24 26 31 29V8Q24 5 17 10Z" fill="#e5eac0"/><path d="M17 10V31M7 15H12M7 21H12M22 15H27M22 21H27M10 3H24"/>',
 slow:'<path d="M5 23Q5 9 17 9Q29 9 29 23Z" fill="#a8c984"/><path d="M17 10V23M7 18H27M10 12L24 23M24 12L10 23M6 25L4 29M27 25L29 29M3 23H31"/><circle cx="30" cy="20" r="2" fill="#e7d5a7"/>',
 drain:'<path d="M6 5H28L25 20H9Z" fill="#e7d5a7"/><path d="M8 12H26M12 25V31M22 25V31M9 28L12 31L15 28M19 28L22 31L25 28"/>',
 moon:'<path d="M22 3A14 14 0 1 0 31 24A14 14 0 0 1 22 3Z" fill="#d9ece6"/><path d="M29 4V10M26 7H32"/>',
 grow:'<path d="M17 30V15M17 21C4 21 5 10 5 10C17 9 17 21 17 21ZM17 17C17 6 29 9 29 9C29 20 17 17 17 17Z" fill="#a8c984"/><path d="M10 31H24M12 6L17 1L22 6M17 1V10"/>',
 hidden:'<path d="M3 16Q17 2 31 16Q17 30 3 16Z" fill="#d9ece6"/><circle cx="17" cy="16" r="5"/><path d="M3 3L31 31"/>',
 star:'<path d="M17 2L22 12L33 14L25 22L27 33L17 28L7 33L9 22L1 14L12 12Z" fill="#eddb93"/>',
 download:'<path d="M17 3V23M10 16L17 23L24 16M5 23V31H29V23"/>',
 print:'<path d="M9 12V3H25V12M9 25H4V12H30V25H25M9 21H25V32H9Z" fill="#e5eac0"/><path d="M13 26H21M25 16H26"/>',
 settings:'<circle cx="17" cy="17" r="9" fill="#e5eac0"/><circle cx="17" cy="17" r="3.5" fill="#a8c984"/><path d="M17 3V8M17 26V31M3 17H8M26 17H31M7 7L10.5 10.5M23.5 23.5L27 27M27 7L23.5 10.5M10.5 23.5L7 27"/>',
 teacher:'<rect x="12" y="3" width="19" height="15" rx="2" fill="#e5eac0"/><path d="M17 8H26M22 18V23M18 23H27"/><circle cx="7" cy="15" r="4" fill="#e7d5a7"/><path d="M2 31V26Q2 21 7 21Q12 21 12 26V31M12 25L20 15"/>',
 open:'<path d="M18 3H31V16M31 3L15 19M12 6H4V30H28V22"/>',
 zoom:'<circle cx="14" cy="14" r="10" fill="#d9ece6"/><path d="M21.5 21.5L30 30M14 9V19M9 14H19"/>'
};
export function iconSvg(name){
 if(!iconPaths[name])throw Error(`Unknown UI icon: ${name}`);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34" fill="none" stroke="#244e3b" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name]}</svg>`;
}
export function setButtonIcon(button,name){delete button.dataset.uiIconAuto;button.dataset.uiIcon=name;}
export function installButtonIcons(){
 const rules=[
  [/^(resume|start reveal|play$)/i,'play'],[/^stop/i,'stop'],
  [/^(hear|say |listen|repeat the prompt|sound$)/i,'sound'],
  [/^(letter name|alphabet name|spell)/i,'letters'],[/^(sound it out|sound families|consonant blends|sound & blend)/i,'blend'],
  [/^short vowels/i,'vowels'],[/^sentence practice/i,'reading'],[/^slower/i,'slow'],
  [/^previous/i,'previous'],[/^next/i,'next'],[/^undo/i,'undo'],
  [/^(replay|restart|new try|play again)/i,'restart'],
  [/^(mark as explored|explored)/i,'check'],[/^(finish|see results)/i,'star'],
  [/^(start detective|guess)/i,'detective'],[/^reveal picture/i,'observe'],
  [/^hide (answer|middle)/i,'hidden'],[/^show (answer|middle)/i,'observe'],
  [/^spin/i,'wheel'],[/^(clear search|clear filters)/i,'clear'],
  [/^(change (teaching |selection|filters)|show all Plants words)/i,'filter'],
  [/^(choose another game|games|phonics menu)/i,'games'],
  [/^download/i,'download'],[/^print/i,'print'],[/^open/i,'open']
 ];
 function decorate(){
  document.querySelectorAll('button').forEach(b=>{
   if(b.matches('.mode-card,.featured-game,.flip-choice,.learn-category-card,.letter-key,.answer-button,.flip-tile,.foundation-variant,.brand-home,.launch-logo,.growth-step'))return;
   if(b.dataset.uiIcon&&!b.dataset.uiIconAuto)return;
   const label=(b.getAttribute('aria-label')||b.textContent).trim().replace(/^↻\s*/,'');
   const found=rules.find(([re])=>re.test(label));
   if(found){b.dataset.uiIconAuto='true';if(b.dataset.uiIcon!==found[1])b.dataset.uiIcon=found[1];}
   else if(b.dataset.uiIconAuto){delete b.dataset.uiIcon;delete b.dataset.uiIconAuto;}
  });
 }
 decorate();const observer=new MutationObserver(decorate);observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label']});
 return()=>observer.disconnect();
}
