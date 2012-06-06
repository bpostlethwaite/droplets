
c=1; % speed of wave;
dx=1; % space step;
dt=0.1; % time step;
szx=10;
szy=10; % sizes
tm=1000; % time
k=0.002; % decay factor

dp=0.01; % droplet probability per one time sterp
dsz=2; % droplet size
da= 0.5; % droplet amplitude

x=dx:dx:szx;
y=dx:dx:szy; % space

Lx=length(x);
Ly=length(y);

u=zeros(Ly,Lx); % initial value
uo=u; % previose = curent => velocties =0

D=[0 1 0; 1 -4 1; 0 1 0]; % 2d laplace operator

c1 = 2 - k * dt;
c2 = k*dt - 1;
c3 = dt^2*c^2/dx^2;

% droplet as gaussian
u(round(szy/2) , round(szx/2) ) = 1;

tic;
for ii = 1:100000

    un = c1*u + c2*uo + c3*conv2(u,D,'same'); % new
    uo=u; % curent become old
    u=un; % new become current
    %full(u)

end
endtime = toc;

fprintf('%4.0f\n',endtime*1000)
