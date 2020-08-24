#include<stdio.h>

int
main()
{
    /*
       ESC[ … 38;5;<n> … m选择前景色
       ESC[ … 48;5;<n> … m选择背景色
       0-  7：标准颜色（同ESC [ 30–37 m）
       8- 15：高强度颜色（同ESC [ 90–97 m）
       16-231：6 × 6 × 6 立方（216色）: 16 + 36 × r + 6 × g + b (0 ≤ r, g, b ≤ 5)
       232-255：从黑到白的24阶灰度色
    */
    printf("\e[38;5;7m\e[48;5;8m%s\e[0m\n", "hello world");
    return 0;
}
