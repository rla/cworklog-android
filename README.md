CWorkLog-Android
================

Android app to access [CWorkLog](https://cworklog.com/). Created using
the [PhoneGap/Cordova](http://phonegap.com/) toolkit.

Building
--------

These instructions cover building the debug version which is signed
by debug keys.

Create directory `android/assets` and symlink `www` directory into it so
that you have the directory `android/assets/www`:

    mkdir android/assets
    ln -sf ../../www android/assets/www

Create file `android/local.properties`. This file depends on the local machine
and is not meant to be added in the git. In the file, add:

    sdk.dir=<your android sdk location>

Make sure that you have the `ant` build tool with version >= 1.8 installed. Particulary,
the `ant` command on the terminal should work.

Go to directory `android` and build the debug version:

    ant debug

If all goes well, it will say `BUILD SUCCESSFUL` at the end. The .apk package will
be placed into the `android/bin` folder. You can also use various other build commands.
Run `ant -p` to see the list of build/deploy targets. The build system uses the default
Android build file which `android/build.xml` just wraps.

License
-------

MIT License, see the LICENSE file.
