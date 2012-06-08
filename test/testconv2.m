function out = testconv2(image, kernel, height, width) 
    % iterates over image, then over kernel and
    % multiplies the flipped kernel coeffs
    % with appropriate image values, sums them
    % then adds into new array entry.
    acc = 0;
    for row = 1 : height 
      for col = 1 : width
        for i = -1 : 1
          for j = -1 : 1
            if ( row + i >= 1 && col + j >= 1 && ...
                row + i <= height && col + j <= width)
              k = image( row + i , col + j );
              acc = acc + k * kernel( 2 + i , 2 + j );
            end
          end
        end
        out(row, col) = acc;
        acc = 0;
      end
    end
   
end