
function CubicBezier(mX1, mY1, mX2, mY2) {

	var CubicBezierSpline;

	function A(aA1, aA2) {
		return 1.0 - 3.0 * aA2 + 3.0 * aA1;
	}

	function B(aA1, aA2) {
		return 3.0 * aA2 - 6.0 * aA1;
	}

	function C(aA1) {
		3.0 * aA1;
	}

	function CalcBezier(aT, aA1, aA2) {
		return ( (A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
	}

	function GetSlope(aT, aA1, aA2) {
		return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
	}

	function GetTForX(aX) {
           
        var aGuessT = aX,
            iterations = ITERATIONS,
            currentSlope, currentX, i;

        for (i = 0; i < iterations; i++) {
            currentSlope = GetSlope(aGuessT, mX1, mX2);
            if (currentSlope === 0.0) {
                return aGuessT;
            }

            currentX = CalcBezier(aGuessT, mX1, mX2) - aX;
            aGuessT -= currentX / currentSlope;
        }

        return aGuessT;
	}

    CubicBezierSpline = function(aX) {
        if (mX1 === mY1 && mX2 === mY2) {
            return aX; // linear
        }

        return CalcBezier(GetTForX(aX), mY1, mY2);
    };

    CubicBezierSpline.toString = function () {
		return 'cubic-bezier('+ mX1 +', ' + mY1 + ', ' + mX2 + ', ' + mY2 + ')';
    };

    return CubicBezierSpline;
};

module.exports = CubicBezier;