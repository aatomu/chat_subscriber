var template_css = `
body {
	background-color: rgba(0, 0, 0, 0);
	overflow: hidden;
}
.channel {
	display: none;
}

.user {
	margin: var(--avator-margin);
	height: var(--icon-size);
}
.icon {
	border-radius: var(--icon-radius);
	filter: brightness(var(--icon-bright));
}
.nick {
	position: var(--name-posi);
	bottom: var(--name-position);
	font-size: var(--name-size);
	color: var(--name-forecolor);
	background-color: var(--name-backcolor);
	border-radius: var(--name-radius);
	display: var(--name-view);
	text-overflow: var(--name-flow);
	padding: var(--name-pdhr) var(--name-pdvr);
}
.me {
	display: var(--me-display);
	order: var(--sort-me);
}
.user:not(.me) {
	display: var(--other-display);
  }
`;

/* -------------------- -------------------- -------------------- */
// Create CSS
/* -------------------- -------------------- -------------------- */
function make_css() {
	let v, cpr, t
	let str = ":root {\n"
	let query = new URLSearchParams();

	$('#configure input[type="range"]').each(function() {
		v = $(this).val();
		cpr = $(this).attr('cstprop');
		query.set(cpr.replace('--',''), v);

		// 名前の縦位置
		if (cpr === '--position') {
			if (v >= 0) {
				str += "--name-position: "+ v +"px;\n";
				str += "--avator-bottom: 0px;\n";
			} else {
				str += "--name-position: 0px;\n";
				str += "--avator-bottom: "+(-1*v)+"px;\n";
			}
		} else {
			t = $(this).attr('csttype');
			if (t === undefined) {
				str += cpr + ": " + v + "px;\n";
			} else {
				str += cpr + ": " + v + t + ";\n";
			}
		}
	});


	$('input[type="radio"]:checked').each(function() {
		let id = $(this).attr('name');
		let v = $(this).val();
		str += "--" + id + ": " + v + ";\n";
		query.set(id, v);
	});

	$('input[type="color"]').each(function() {
		v = $(this).val();
		let id = $(this).attr('id');
		str += "--" + id + ": " + v + ";\n";
		query.set(id, v.replace('#',''));
	});
	str += "}\n"

	// 非表示にする人
	// v = $("input#disable-id").val();
	// if (v !== "") {
	// 	str += "img[src*='" + v + "'] { display:none; }\n";
	// }

	str += template_css;
	$("#css textarea").val(str);
	$("#urlquery").val(location.origin + location.pathname+ "?" +query.toString());
}

/* -------------------- -------------------- -------------------- */
// 変更イベント
/* -------------------- -------------------- -------------------- */
const html = document.querySelector('html');
function CSS_CHANGE(e) {
	let v = e.val();
	e.next().val(v);
	let cpr = e.attr('cstprop');
	if (cpr === '--position') {
		if (v >= 0) {
			html.style.setProperty("--name-position",v+"px")
			html.style.setProperty("--avator-bottom","0px")
		} else {
			html.style.setProperty("--name-position","0px")
			html.style.setProperty("--avator-bottom",(-1*v)+"px")
		}
		return
	}
	if (cpr === '--icon-size') {
		t = Math.ceil(v/2);
		$('#slider-img-radi').attr('max', t);
	}
	t = e.attr('csttype');
	if (t === undefined) {
		html.style.setProperty(cpr, v+"px");
	} else {
		html.style.setProperty(cpr, v+t);
	}
}

/* -------------------- -------------------- -------------------- */
// Event
/* -------------------- -------------------- -------------------- */
$(function() {
	$('.accordion').accordion({active:0, collapsible: true});

	let min, max, v;
	$('#configure input[type="range"]').each(function() {
		min = $(this).attr('min');
		max = $(this).attr('max');
		v= $(this).val();
	console.log(min, max, v);
		$(this).after('<input type="number" min="'+ min +'" max="'+ max +'" value="'+ v +'">');
	});
	$('#configure input[type="number"]').on('input', function() {
		v = $(this).val();
		$(this).prev().val(v);
	});


	$('input[type="range"]').on('input', function() {
		CSS_CHANGE($(this));
	});
	$('input[type="number"]').on('input', function() {
		CSS_CHANGE($(this).prev());
	});

	// ラジオボタン関連
	$('input:radio').on('change', function() {
		let name = $(this).attr('name');
		html.style.setProperty("--"+name, $(this).val());
	});

	// 色関連
	$('input[type="color"]').each(function() {
		$(this).on('input', function(e) {
			v = e.target.value
			let id = $(this).attr('id');
			$(this).next().text(v);
			html.style.setProperty("--" + id, v);
		});
	});

	$('#cssset').click(make_css);
});

/* -------------------- -------------------- -------------------- */
// URL Query Analysis
/* -------------------- -------------------- -------------------- */
$(function() {
	let query = new URLSearchParams(location.search);
	let obj;
	let select = ['name-view','name-align','name-flow','name-posi','name-left','name-right'];
	query.forEach(function(value, key) {
		if (key.indexOf('color') !== -1) {
			obj = $("input#"+key);
			obj.val('#'+value);
			obj.next().text('#'+value);
			html.style.setProperty("--"+key, '#'+value);
		} else if (select.includes(key)) {
			obj = $("input:radio[name="+key+"][value="+value+"]");
			obj.prop('checked', true);
			html.style.setProperty("--"+key, value);
		} else {
			obj = $("[cstprop='--"+ key +"']");
			obj.val(value);
			CSS_CHANGE(obj);
		}
	})
	// $("#urlquery").val(location.href);
});