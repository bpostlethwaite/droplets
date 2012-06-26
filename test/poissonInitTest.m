% Poisson Init test

clear all
close all

height = 20;
width = 20;

x = floor(0.5 * height);
y = floor(0.5 * width) ;

for ii = 1:height
    for jj = 1:width
        u(ii,jj) = 3 - 3 /  sqrt(sqrt( (ii - x)^2 + (jj -  y)^2))  ;
    end
end

u(x,y) = 0;

mesh(u)
colorbar