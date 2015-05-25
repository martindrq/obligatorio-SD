$(document).ready(function(){
	$('#searchTag').submit(function(e){
		e.preventDefault();
		$.get('search/?name='+$('#tag').val(), function(resp){
			$('#filesList li').remove();
			console.log(resp)
			$.each(resp, function(index,file) {
			    $('#filesList').append('<li><a href="download/'+file.name+'" class="name">'+file.name+'</a></li>')
			  });
			console.log(resp)
		});
	});

});