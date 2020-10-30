#include <stdio.h>

int
main() {
    FILE *fp = fopen("cp437_unicode.txt", "r");
    unsigned short cp, uni;
    unsigned char u[4];
    for (int i=0; i<256; i++) {
        fscanf(fp, "%hx %hx", &cp, &uni);
        printf("%02x %04x ", cp, uni);
        if ( uni <= 0x7F )
        {
            u[0]     = (uni & 0x7F);
            printf("%c ", u[0]);
            printf("1 %hhx\n", u[0]);
        } 
        else if ( uni >= 0x80 && uni <= 0x7FF )
        {
            u[1] = (uni & 0x3F) | 0x80;
            u[0] = ((uni >> 6) & 0x1F) | 0xC0;
            printf("%c%c ", u[0], u[1]);
            printf("2 %hhx %hhx\n", u[0], u[1]);
        }
        else if ( uni >= 0x800 && uni <= 0xFFFF )
        {
            u[0] = ((uni >> 12) & 0x0F) | 0xE0;
            u[1] = ((uni >>  6) & 0x3F) | 0x80;
            u[2] = (uni & 0x3F) | 0x80;
            printf("%c%c%c ", u[0], u[1], u[2]);
            printf("3 %hhx %hhx %hhx\n", u[0], u[1], u[2]);
        }
    }
    return 0;
}
