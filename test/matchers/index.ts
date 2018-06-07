import toBeAprox from './toBeAprox';
import toBeTrue from './toBeTrue';
import toBeFalse from './toBeFalse';

declare global {
    namespace jest {
        interface Matchers {
            toBeTrue(): boolean;
            toBeFalse(): boolean;
            toBeAprox(value: number, decimals?: number): boolean;
        }
    }
}

expect.extend({
    toBeTrue,
    toBeFalse,
    toBeAprox,
});
