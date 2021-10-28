# If PREFIX isn't provided, we check for $(DESTDIR)/usr/local and use that if it exists.
# Otherwice we fall back to using /usr.

LOCAL != test -d $(DESTDIR)/usr/local && echo -n "/local" || echo -n ""
LOCAL ?= $(shell test -d $(DESTDIR)/usr/local && echo "/local" || echo "")
PREFIX ?= /usr$(LOCAL)

default:
	# Run "sudo make install" to install the application.
	# Run "sudo make uninstall" to uninstall the application.

install:
	install -Dm00644 usr/local/share/applications/gui.desktop $(DESTDIR)$(PREFIX)/share/applications/gui.desktop
	install -Dm00755 usr/local/bin/gui $(DESTDIR)$(PREFIX)/bin/gui
	install -Dm00644 usr/local/share/pixmaps/gui.png $(DESTDIR)$(PREFIX)/share/pixmaps/gui.png
uninstall:
	-rm $(DESTDIR)$(PREFIX)/share/applications/gui.desktop
	-rm $(DESTDIR)$(PREFIX)/bin/gui
	-rm $(DESTDIR)$(PREFIX)/share/pixmaps/gui.png