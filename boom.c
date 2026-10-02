
#include <stdio.h>
int main()
{
    float fahrenheit, celsius;
    int choice;

    printf("Temperature Conversion Menu:\n");
    printf("1. Fahrenheit to Celsius\n");
    printf("2. Celsius to Fahrenheit\n");
    printf("Enter your choice (1 or 2): ");
    scanf("%d", &choice);

    if (choice == 1)// Convert Fahrenheit to Celsius
    {
        printf("Enter temperature in Fahrenheit: ");
        scanf("%f", &fahrenheit);
        celsius = (fahrenheit - 32) * 5 / 9; // Convert Fahrenheit to Celsius
        printf("%.2f Fahrenheit = %.2f Celsius\n", fahrenheit, celsius);
    }
    else if (choice == 2)// Convert Celsius to Fahrenheit
    {
        printf("Enter temperature in Celsius: ");
        scanf("%f", &celsius);
        fahrenheit = (celsius * 9 / 5) + 32; // Convert Celsius to Fahrenheit
        printf("%.2f Celsius = %.2f Fahrenheit\n", celsius, fahrenheit);
    }
    else
    {
        printf("Invalid choice! Please select either 1 or 2.\n");
    }

    return 0;
}

