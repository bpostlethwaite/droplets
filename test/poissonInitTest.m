% Poisson Init test

clear all
close all

height = 100;
width = 300;

x = floor(0.5 * height);
y = floor(0.5 * width) ;

for ii = 1:height
    for jj = 1:width
        u(ii,jj) = 40 - 40 /  (sqrt( (ii - x)^2 + (jj -  y)^2))  ;
    end
end

u(x,y) = 0;

mesh(u)
colorbar