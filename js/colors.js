
  // Add a function to style the counties by their confirmed cases (ck means)
  function getCaseColor(caseStops, d) {
   return d >= ss.min(caseStops[8]) ? '#651d27' :
     d >= ss.min(caseStops[7]) ? '#8b1d2c' :
     d >= ss.min(caseStops[6]) ? '#ae2a2f' :
     d >= ss.min(caseStops[5]) ? '#cf3236' :
     d >= ss.min(caseStops[4]) ? '#ef5144' :
     d >= ss.min(caseStops[3]) ? '#f97a5e' :
     d >= ss.min(caseStops[2]) ? '#fac1aa' :
     d >= ss.min(caseStops[1]) ? '#fce2d5' :
     d >= ss.min(caseStops[0]) ? '#fdf4f0' :
     'rgba(0,0,0,0.0)';
 };

// Add a function to style the counties by their confirmed deaths (ck means)
function getRecoveredColor(recoveredStops, d) {
   return d >= ss.min(recoveredStops[6]) ? '#463669' :
      d >= ss.min(recoveredStops[5]) ? '#5D488C' :
      d >= ss.min(recoveredStops[4]) ? '#755baf' :
      d >= ss.min(recoveredStops[3]) ? '#907BBF' :
      d >= ss.min(recoveredStops[2]) ? '#AC9CCF' :
      d >= ss.min(recoveredStops[1]) ? '#C7BDDF' :
      d >= ss.min(recoveredStops[0]) ? '#E3DEEF' :
      'rgba(0,0,0,0.0)';
   };