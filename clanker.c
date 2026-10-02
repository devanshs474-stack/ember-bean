/*WAP to read a character and print ACSII value of it

#include <stdio.h>

int main() {
   char ch;
   printf("Enter a character: ");
   scanf(" %c", &ch);
   printf("The ASCII value of '%c' = %d\n", ch, ch);// Print the ASCII value of the character
   return 0;
}*/

/* WAP tp read statement  in lower case and print in upper case
#include <stdio.h>
#include <ctype.h>// Include the ctype.h header for character handling functions

int main() {
    char str[100];// Declare a character array to hold the input string
    printf("Enter a statement in lowercase: ");
    fgets(str, sizeof(str), stdin);// Read a line of input from the user

    printf("The statement in uppercase is: ");
    for (int i = 0; str[i] != '\0'; i++) // Loop through each character in the string until the null terminator is reached
    {
        if (islower(str[i])) // Check if the character is a lowercase letter
        {
            str[i] = toupper(str[i]); // Convert the lowercase letter to uppercase
        }
        printf("%c", str[i]);
    }
    printf("\n");
    return 0;
}*/

/* WAp to swap two numbers using a temporary variable
#include <stdio.h>

int main()
{
    int a, b, temp;
    printf("Enter two numbers: ");
    scanf("%d %d", &a, &b); // Read two integers from the user

    printf("Before swapping: a = %d, b = %d\n", a, b);

    // Swap the values using a temporary variable
    temp = a;
    a = b;
    b = temp;

    printf("After swapping: a = %d, b = %d\n", a, b);
    return 0;
}*/

/* WAP to swap two numbers without using a temporary variable

#include <stdio.h>

int main()
{
    int a, b;
    printf("Enter two numbers: ");
    scanf("%d %d", &a, &b); // Read two integers from the user

    printf("Before swapping: a = %d, b = %d\n", a, b);

    // Swap the values without using a temporary variable
    a = a + b;
    b = a - b;
    a = a - b;

    printf("After swapping: a = %d, b = %d\n", a, b);
    return 0;
}*/

/*WAP to calculate simple interest
#include <stdio.h>

int main()
{
    float principal, rate, time, si;

    // Input principal amount, rate of interest, and time period
    printf("Enter principal amount: ");
    scanf("%f", &principal);
    printf("Enter rate of interest (in percentage): ");
    scanf("%f", &rate);
    printf("Enter time period (in years): ");
    scanf("%f", &time);

    // Calculate simple interest
    si = (principal * rate * time) / 100;

    // Output the result
    printf("Simple Interest = %.2f\n", si);
    return 0;
} */
