import BaseTest from '@/tests/BaseTest';

class ExampleTest extends BaseTest {
  public run(): void {
    describe('example', (): void => {
      it('2 + 2 should be 4', (): void => {
        expect(2 + 2).toBe(4);
      });
    });
  }
}

new ExampleTest().run();
