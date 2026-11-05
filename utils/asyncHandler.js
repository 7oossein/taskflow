export default function asyncHandler(fonction) {
    return function (req, res, next) {
        Promise.resolve(fonction(req, res, next))
            .catch(next);
    };
}