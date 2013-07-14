all: marked bundle

marked:
	cat docs/readme.md | marked --gfm --breaks > docs/readme.html
	cat docs/resume.md | marked --gfm --breaks > docs/resume.html

bundle:
	browserify -t brfs entry.js > public/bundle.js


run: all
	node server.js

clean:
	rm static/bundle.js
	rm docs/*.html
