% Gauss Seidel SOR
clear all
close all

m = 100;
n = 100;


% Gauss Seidel Method

source = [50, 50;
          20, 70];
             
for ii = 1:m
    for jj = 1:n
        u(ii,jj) = 1 - 1 /  sqrt(sqrt( (ii - source(1,1) )^2 + (jj -  source(1,2))^2))  ;
    end
end

u(50,50) = 0;
figure(1)
imagesc(u)
      
for q = 1:10000
    for i = 2 : m-1 
        for j = 2 : n-1
            u(i,j) = (u(i-1,j) + u(i+1,j) + ...
                             u(i,j-1) + u(i,j+1))/4;
            for k = 1:length(source)
                if i == source(k,1) && j == source(k,2)
                    u(i,j) = 0;
                end
            end
        end
    end
    figure(2)
    imagesc(u)
    colorbar
end