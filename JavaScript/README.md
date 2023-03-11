The Core2-Core4 folders include a symlink folder "lib" referencing Core1/lib, and the folders Core3/framework and Core4/framework include symlinks to Core2/framework files allowing shared use for development.

For deploying to a website, the Core2-Core4 folders should be copied to another repo folder, such that these symlink files are replaced by the referenced files.