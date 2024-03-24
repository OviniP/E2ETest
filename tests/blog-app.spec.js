const {test, expect, beforeEach, describe} = require('@playwright/test')
const {loginWith,createBlog} = require('./tests.helper')
const { info } = require('console')
const { title } = require('process')

describe('Blog App', () => {
    beforeEach(async({page, request}) => {
        const res1 = await request.post('http://localhost:3003/api/testing/reset')
        const res2 = await request.post('http://localhost:3003/api/users',{
                data: {
                userName:'Ovini',
                password:'ovini123',
                name:'Ovini Poornima'
                }
            })

        await page.goto('http://localhost:5173')
    })


    test('Login form is shown', async ({page}) => {
        const loginForm = page.getByText('Login to Application')
        await expect(loginForm).toBeVisible()
    })

    describe('Login' , () => {
        test('succeeds with correct credentials', async ({page}) => {
            await loginWith(page,'Ovini','ovini123')

            const blogForm = page.getByText('blogs')
            await expect(blogForm).toBeVisible()
        })

        test('fail with wrong credentials', async({page}) => {
            await loginWith(page,'Ovini1','ovini123')

            const errorDiv = page.locator('.error')
            await expect(errorDiv).toContainText('Wrong username or password') 
            await expect(errorDiv).toHaveCSS('border-style', 'solid')
            await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')
        })
    })

    describe('when loggedin', () => {
        beforeEach(async ({page}) => {
            await loginWith(page,'Ovini','ovini123')
        })

        test('a blog can be created', async ({page}) => {
            const blog = {
                title: 'New Blog',
                author : 'author',
                url: 'http://test.com'
            }
            await createBlog(page, blog.title, blog.author, blog.url)

            const infoDiv =  page.locator('.info')
            await expect(infoDiv).toHaveText(`A new Blog ${blog.title} by Ovini Poornima`)

            const blogList = page.getByTestId('blog-container')
            await expect(blogList).toContainText(`${blog.title}  ${blog.author}`)
        })

        test('a blog can be edited', async({page}) => {
            const blog = {
                title: 'New Blog',
                author : 'author',
                url: 'http://test.com'
            }
            await createBlog(page, blog.title, blog.author, blog.url)
            await page.getByRole('button', { name: 'View' }).click()
            const likesCount = page.getByTestId('likesCount').textContent()
            await page.getByRole('button', { name: 'Like' }).click()
            const newLikesCount = page.getByTestId('likesCount')
            await expect(parseInt(newLikesCount)).toBe(parseInt(likesCount) + 1)
        })

        test('a blog can be deleted', async({page}) => {
            const blog = {
                title: 'New Blog',
                author : 'author',
                url: 'http://test.com'
            }
            await createBlog(page, blog.title, blog.author, blog.url)
            await page.getByRole('button', { name: 'View' }).click()
            //await page.pause()
            await page.getByRole('button', { name: 'Remove' }).click()
            page.on('dialog', async dialog => {
                expect(dialog.message()).toContain('Delete blog New Blog');
                await dialog.accept();
              });
           //await expect(page.getByTestId('blog-header')).toHaveCount(0)
        })

    test('blog remove button visible only for the blog creator', async ({page, request}) => {
        const blog = {
            title: 'New Blog',
            author : 'author',
            url: 'http://test.com'
        }
        await createBlog(page, blog.title, blog.author, blog.url)
        await page.getByRole('button', { name: 'Logout' }).click()

        const res2 = await request.post('http://localhost:3003/api/users',{
            data: {
            userName:'Ovini1',
            password:'ovini123',
            name:'Ovini Poornima'
            }
        })

        await loginWith(page,'Ovini1','ovini123')
        await expect(page.getByRole('button', { name: 'Remove' })).toHaveCount(0)

    })

    test('blogs are orders by likes descending', async ({page}) => {
        const blog1 = {
            title: 'New Blog1',
            author : 'author',
            url: 'http://test.com'
        }
        const blog2 = {
            title: 'New Blog2',
            author : 'author',
            url: 'http://test.com'
        }
        const blog3 = {
            title: 'New Blog3',
            author : 'author',
            url: 'http://test.com'
        }
        await createBlog(page, blog1.title, blog1.author, blog1.url)
        await createBlog(page, blog2.title, blog2.author, blog2.url)
        await createBlog(page, blog3.title, blog3.author, blog3.url)

        const locator = await page.getByTestId('blog').nth(1)

        await locator.getByRole('button', { name: 'View' }).click()
        await locator.getByRole('button', { name: 'Like' }).click()

        await expect(page.getByTestId('blog-header').nth(0)).toContainText(blog2.title)
    })

    })
})

