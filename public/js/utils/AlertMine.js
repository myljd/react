
window.alert = function(txt)
{
    var modal = $('#alertBefore');
    var modalDiv = $('#alertAfter');
    $('#alertTxt').empty();
    $('#alertTxt').append(txt);
    
    modal.addClass('show');
    modalDiv.css('width', '100%');
    modalDiv.css('height', '100%');
    
}