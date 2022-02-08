The Core2-Core4 folders include a symlink folder "lib" referencing Core1/lib, and the folders Core3/OESjs-Core3 and Core4/OESjs-Core4 include symlinks to Core2/OESjs-Core2 files allowing shared use for development.

For deploying to a website, the Core0-Core4 folders have to be copied to another repo folder, such that these symlink files are replaced by the referenced files.