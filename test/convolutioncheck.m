clear all; close all;

C = [1.3, 2.3, 3.3, 4.3, 5.3, 4.3;
     6.3, 7.3, 8.3, 9.3, 1.3, 3.3;
     1.3, 2.3, 3.3, 4.3, 5.3, 2.3;
     6.3, 7.3, 8.3, 9.3, 1.3, 7.3;
     1.0, 2.0, 3.0, 4.0, 5.0, 1.0;
     6.0, 7.0, 8.0, 9.0, 1.0, 1.0];


coeffs = [0, 1, 0;
          1, -4, 1;
          0, 1, 0];

m = 10;
n = 10;
%A = 1.1 * ones(m,n);
A = zeros(m,n);
A( round(m/2) , round(n/2) ) = 1;
C2 = C;
A2 = A;

for ii = 1 : 2000
    A = testconv2(A, coeffs, m, n);
    A2 = conv2(A2, coeffs, 'same');
end
 
 full(A)
 full(A2)
 
 
